package org.alfresco.slingshot.documentlibrary.action;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.Serializable;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.Properties;

import javax.activation.DataHandler;
import javax.activation.MimetypesFileTypeMap;
import javax.mail.BodyPart;
import javax.mail.Message;
import javax.mail.MessagingException;
import javax.mail.Multipart;
import javax.mail.Session;
import javax.mail.internet.InternetAddress;
import javax.mail.internet.MimeBodyPart;
import javax.mail.internet.MimeMessage;
import javax.mail.internet.MimeMultipart;
import javax.mail.util.ByteArrayDataSource;

import org.alfresco.error.AlfrescoRuntimeException;
import org.alfresco.model.ContentModel;
import org.alfresco.repo.admin.SysAdminParams;
import org.alfresco.repo.content.MimetypeMap;
import org.alfresco.repo.security.authentication.AuthenticationUtil;
import org.alfresco.service.ServiceRegistry;
import org.alfresco.service.cmr.repository.ContentData;
import org.alfresco.service.cmr.repository.ContentReader;
import org.alfresco.service.cmr.repository.NodeRef;
import org.alfresco.service.cmr.repository.NodeService;
import org.alfresco.service.cmr.security.PersonService;
import org.alfresco.service.cmr.site.SiteService;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.springframework.extensions.webscripts.DeclarativeWebScript;
import org.springframework.extensions.webscripts.Status;
import org.springframework.extensions.webscripts.WebScriptException;
import org.springframework.extensions.webscripts.WebScriptRequest;
import org.springframework.mail.javamail.JavaMailSender;

public class SendContentMailPost extends DeclarativeWebScript {
	
	private String mailSubject = "Alfresco Mail Share";
	
	private int attachmentSizeLimit; 

	private static Log logger = LogFactory.getLog(SendContentMailPost.class);

	private NodeService nodeService;

	private PersonService personService;

	private JavaMailSender mailService;

	/**
	 * The Alfresco Service Registry that gives access to all public content
	 * services in Alfresco.
	 */
	private ServiceRegistry serviceRegistry;

	private SysAdminParams sysAdminParams;

	private SiteService siteService;

	public void setServiceRegistry(ServiceRegistry serviceRegistry) {
		this.serviceRegistry = serviceRegistry;
	}

	public void setNodeService(NodeService nodeService) {
		this.nodeService = nodeService;
	}

	public void setPersonService(PersonService personService) {
		this.personService = personService;
	}

	public void setMailService(JavaMailSender javaMailSender) {
		this.mailService = javaMailSender;
	}

	public void setSysAdminParams(SysAdminParams sysAdminParams) {
		this.sysAdminParams = sysAdminParams;
	}

	public void setSiteService(SiteService siteService) {
		this.siteService = siteService;
	}

	public void setAttachmentSizeLimit(int attachmentSizeLimit) {
		this.attachmentSizeLimit = attachmentSizeLimit;
	}

	@Override
	protected Map<String, Object> executeImpl(WebScriptRequest req, Status status) {
		int responseStatus = 0;
		String message = "";
		try {
			List<NodeRef> nodeRefs = getNodeRefsFromRequest(req);
			sendMail(nodeRefs);
		} catch (WebScriptException ex) {
			responseStatus = ex.getStatus();
			message = ex.getMessage();
			if (Character.isDigit(message.charAt(0))) {
				message = message.substring(message.indexOf(" ")+1);
			}
		}
		if (responseStatus == 0) {
			responseStatus = 200;
			message = "OK";
		}
		status.setCode(responseStatus);
		status.setMessage(message);
		Map<String, Object> model = new HashMap<String, Object>();
		model.put("responseStatus", responseStatus);
		model.put("message", message);
		return model;
	}

	private List<NodeRef> getNodeRefsFromRequest(WebScriptRequest req) {

		JSONArray json = null;
		String contentType = req.getContentType();
		if (contentType != null && contentType.indexOf(';') != -1) {
			contentType = contentType.substring(0, contentType.indexOf(';'));
		}

		List<NodeRef> nodes = new LinkedList<NodeRef>();
		if (MimetypeMap.MIMETYPE_JSON.equals(contentType)) {
			JSONParser parser = new JSONParser();
			try {
				JSONObject jsonObj = new JSONObject();
				jsonObj = (JSONObject) parser.parse(req.getContent().getContent());
				json = (JSONArray) jsonObj.get("nodeRefs");
				// json = (JSONArray)
				// parser.parse(req.getContent().getContent());
				for (int i = 0; i < json.size(); i++) {
					JSONObject obj = (JSONObject) json.get(i);
					String nodeRefString = (String) obj.get("nodeRef");
					if (nodeRefString != null) {
						if (serviceRegistry.getNodeService().exists(new NodeRef(nodeRefString)) == true) {
							nodes.add(new NodeRef(nodeRefString));
						}
					}
				}
				mailSubject = (String) jsonObj.get("subject");
			} catch (IOException io) {
				// Unexpected IOException
				throw new WebScriptException(Status.STATUS_INTERNAL_SERVER_ERROR, "unknown-error", io);
			} catch (org.json.simple.parser.ParseException je) {
				// Unexpected ParseException
				throw new WebScriptException(Status.STATUS_BAD_REQUEST, "unknown-error", je);
			}
		}
		return nodes;
	}

	private void sendMail(List<NodeRef> nodeRefs) {
		String fullyAuthenticatedUser = AuthenticationUtil.getFullyAuthenticatedUser();
		NodeRef person = personService.getPerson(fullyAuthenticatedUser, false);
		String to = (String) nodeService.getProperty(person, ContentModel.PROP_EMAIL);

		try {
			// Create mail session
			Properties mailServerProperties = new Properties();
			Session session = Session.getDefaultInstance(mailServerProperties, null);
			session.setDebug(false);

			// Define message
			MimeMessage message = mailService.createMimeMessage();
			String fromAddress = to;
			message.setFrom(new InternetAddress(fromAddress));
			message.addRecipient(Message.RecipientType.TO, new InternetAddress(to));
			message.setSubject(mailSubject);

			// Create the message part with body text
			BodyPart messageBodyPart = new MimeBodyPart();
			String messageBodyText = buildBodyText(nodeRefs);
			messageBodyPart.setText(messageBodyText);
			Multipart multipart = new MimeMultipart();
			multipart.addBodyPart(messageBodyPart);
			float totalFileSize = 0;
			// Create the Attachment part
			for (NodeRef actionedUponNodeRef : nodeRefs) {
				// Get document filename
				Serializable filename = serviceRegistry.getNodeService().getProperty(actionedUponNodeRef,
						ContentModel.PROP_NAME);
				if (filename == null) {
					throw new AlfrescoRuntimeException("Document filename is null");
				}
				String documentName = (String) filename;

				// Get the document content bytes
				byte[] documentData = getDocumentContentBytes(actionedUponNodeRef, documentName);
				if (documentData == null) {
					throw new AlfrescoRuntimeException("Document content is null");
				}

				// get file size
				ContentData content = (ContentData) serviceRegistry.getNodeService().getProperty(actionedUponNodeRef,
						ContentModel.PROP_CONTENT);
				float currentFileSizeBytes = content.getSize();
				float currentFileSizeMBytes = (currentFileSizeBytes / 1024) / 1024;
				totalFileSize += currentFileSizeMBytes;

				// Attach document
				messageBodyPart = new MimeBodyPart();
				messageBodyPart.setDataHandler(new DataHandler(new ByteArrayDataSource(documentData,
						new MimetypesFileTypeMap().getContentType(documentName))));
				messageBodyPart.setFileName(documentName);
				multipart.addBodyPart(messageBodyPart);
			}
			// Check for file size limit
			if (totalFileSize > attachmentSizeLimit) {
				throw new WebScriptException(Status.STATUS_BAD_REQUEST, "too-big".toString());
			}
			// Put parts in message
			message.setContent(multipart);
			mailService.send(message);
			logger.debug("Send email with content to " + to);
		} catch (MessagingException me) {
			throw new AlfrescoRuntimeException("Could not send email: " + me.getMessage());
		}
	}

	private String buildBodyText(List<NodeRef> nodeRefs) {
		StringBuilder bodyText = new StringBuilder();
		for (NodeRef actionedUponNodeRef : nodeRefs) {
			bodyText.append(nodeService.getProperty(actionedUponNodeRef, ContentModel.PROP_NAME) + "\n");
			// TODO do we need the port in prod?
			bodyText.append(sysAdminParams.getAlfrescoProtocol() + "://" + sysAdminParams.getAlfrescoHost() + ":"
					+ sysAdminParams.getAlfrescoPort() + "/share/page/site/"
					+ siteService.getSiteShortName(actionedUponNodeRef) + "/document-details?nodeRef="
					+ actionedUponNodeRef.getStoreRef() + "/" + actionedUponNodeRef.getId() + "\n\n");
		}
		return bodyText.toString();
	}

	/**
	 * Get the content bytes for the document with passed in node reference.
	 *
	 * @param documentRef
	 *            the node reference for the document we want the content bytes
	 *            for
	 * @param documentFilename
	 *            document filename for logging
	 * @return a byte array containing the document content or null if not found
	 */
	private byte[] getDocumentContentBytes(NodeRef documentRef, String documentFilename) {
		// Get a content reader
		ContentReader contentReader = serviceRegistry.getContentService().getReader(documentRef,
				ContentModel.PROP_CONTENT);
		if (contentReader == null) {
			logger.error("Content reader was null [filename=" + documentFilename + "][docNodeRef=" + documentRef + "]");

			return null;
		}

		// Get the document content bytes
		InputStream is = contentReader.getContentInputStream();
		ByteArrayOutputStream bos = new ByteArrayOutputStream();
		byte[] documentData = null;

		try {
			byte[] buf = new byte[1024];
			int len = 0;
			while ((len = is.read(buf)) > 0) {
				bos.write(buf, 0, len);
			}
			documentData = bos.toByteArray();
		} catch (IOException ioe) {
			logger.error("Content could not be read: " + ioe.getMessage() + " [filename=" + documentFilename
					+ "][docNodeRef=" + documentRef + "]");
			return null;
		} finally {
			if (is != null) {
				try {
					is.close();
				} catch (Throwable e) {
					logger.error("Could not close doc content input stream: " + e.getMessage() + " [filename="
							+ documentFilename + "][docNodeRef=" + documentRef + "]");
				}
			}
		}

		return documentData;
	}
}