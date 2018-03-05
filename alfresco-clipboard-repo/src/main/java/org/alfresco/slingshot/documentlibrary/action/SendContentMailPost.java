package org.alfresco.slingshot.documentlibrary.action;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.Serializable;
import java.util.*;

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
import org.springframework.extensions.webscripts.Cache;

public class SendContentMailPost extends DeclarativeWebScript {
	
	private String defaultMailSubject = "Alfresco Mail Share";
	
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
	protected Map<String, Object> executeImpl(WebScriptRequest req, Status status, Cache cache) {
		int responseStatus = 0;
		String message = "";
		try {
			JSONObject payload = getPayloadFromRequest(req);
			List<NodeRef> nodeRefs = getNodeRefsFromPayload(payload);
            Set<String> emails = getEmailsFromPayload(payload);
            String subject = getSubjectFromPayload(payload);
            boolean attachDocuments = getAttachDocumentsFromPayload(payload);
			sendMail(nodeRefs, emails, subject, attachDocuments);
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

	private boolean getAttachDocumentsFromPayload(JSONObject payload) {
		if (payload.containsKey("attachDocuments")) {
			return payload.get("attachDocuments").toString().equalsIgnoreCase("true");
		}
		return false;
	}

	private String getSubjectFromPayload(JSONObject payload) {
		if (payload.containsKey("subject")) {
			return (String) payload.get("subject");
		}else if (payload.containsKey("prop_subject")) {
			return (String) payload.get("prop_subject");
		}
		return defaultMailSubject;
	}

	private Set<String> getEmailsFromPayload(JSONObject payload) {
		PersonService personService = serviceRegistry.getPersonService();
	    Set<String> result = new HashSet<String>();

	    if (payload.containsKey("users")){
	    	JSONArray users = (JSONArray) payload.get("users");
	    	for (int i = 0; i < users.size(); i++) {
				NodeRef personNode = personService.getPerson((String) users.get(i));
				result.add(getEmailFromPersonNode(personNode));
			}
		}else if (payload.containsKey("users_added")){ // trying to make as little change as possible to the form-control used to enter users
	    	String[] userNodes = payload.get("users_added").toString().split(",");
	    	for (String userNodeStr : userNodes){
	    		if (userNodeStr.isEmpty()){
	    			continue;
				}
	    		result.add(getEmailFromPersonNode(new NodeRef(userNodeStr)));
			}
		}
	    if (payload.containsKey("emails")){
	    	String[] emails = payload.get("emails").toString().split(",");
	    	for (String email : emails) {
				String trimmedEmail = email.trim();
				if (trimmedEmail.isEmpty()) {
					continue;
				}
				result.add(trimmedEmail);
			}
		}
		// Always send to the currently authenticated user as well
		String fullyAuthenticatedUser = AuthenticationUtil.getFullyAuthenticatedUser();
		NodeRef person = personService.getPerson(fullyAuthenticatedUser, false);
		result.add(getEmailFromPersonNode(person));


        return result;
    }

	private String getEmailFromPersonNode(NodeRef personNode) {
		return (String) nodeService.getProperty(personNode, ContentModel.PROP_EMAIL);
	}

	private JSONObject getPayloadFromRequest(WebScriptRequest req){
		String contentType = req.getContentType();
		if (contentType != null && contentType.indexOf(';') != -1) {
			contentType = contentType.substring(0, contentType.indexOf(';'));
		}


		if (MimetypeMap.MIMETYPE_JSON.equals(contentType)) {
			JSONParser parser = new JSONParser();
			try {
				JSONObject jsonObj = new JSONObject();
				return (JSONObject) parser.parse(req.getContent().getContent());
			} catch (IOException io) {
				// Unexpected IOException
				throw new WebScriptException(Status.STATUS_INTERNAL_SERVER_ERROR, "unknown-error", io);
			} catch (org.json.simple.parser.ParseException je) {
				// Unexpected ParseException
				throw new WebScriptException(Status.STATUS_BAD_REQUEST, "unknown-error", je);
			}
		}
		throw new WebScriptException(Status.STATUS_BAD_REQUEST, "json.payload.not-found");
    }

    private List<NodeRef> getNodeRefsFromPayload(JSONObject payload) {

		JSONArray json = null;

		json = (JSONArray) payload.get("nodeRefs");

		List<NodeRef> nodes = new LinkedList<NodeRef>();
		for (int i = 0; i < json.size(); i++) {
			JSONObject obj = (JSONObject) json.get(i);
			String nodeRefString = (String) obj.get("nodeRef");
			if (nodeRefString != null) {
				if (serviceRegistry.getNodeService().exists(new NodeRef(nodeRefString))) {
					nodes.add(new NodeRef(nodeRefString));
				}
			}
		}
		return nodes;
	}

	private void sendMail(List<NodeRef> nodeRefs, Set<String> emailsTo, String mailSubject, boolean attachDocuments) {

		try {
			// Create mail session
			Properties mailServerProperties = new Properties();
			Session session = Session.getDefaultInstance(mailServerProperties, null);
			session.setDebug(false);

			// Define message
			MimeMessage message = mailService.createMimeMessage();
			String fullyAuthenticatedUser = AuthenticationUtil.getFullyAuthenticatedUser();
			NodeRef person = personService.getPerson(fullyAuthenticatedUser, false);
			// Always use currently authenticated user as sender
			String fromAddress = getEmailFromPersonNode(person);
			message.setFrom(new InternetAddress(fromAddress));
			for (String to : emailsTo) {
				message.addRecipient(Message.RecipientType.TO, new InternetAddress(to));
			}
			message.setSubject(mailSubject);

			// Create the message part with body text
			BodyPart messageBodyPart = new MimeBodyPart();
			String messageBodyText = buildBodyText(nodeRefs);
			messageBodyPart.setText(messageBodyText);
			Multipart multipart = new MimeMultipart();
			multipart.addBodyPart(messageBodyPart);
			if (attachDocuments) {
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
			}
			// Put parts in message
			message.setContent(multipart);
			mailService.send(message);
			logger.debug("Sent email to " + emailsTo);
		} catch (MessagingException me) {
			throw new AlfrescoRuntimeException("Could not send email: " + me.getMessage());
		}
	}

	private String buildBodyText(List<NodeRef> nodeRefs) {
		StringBuilder bodyText = new StringBuilder();
		for (NodeRef actionedUponNodeRef : nodeRefs) {
			bodyText.append(nodeService.getProperty(actionedUponNodeRef, ContentModel.PROP_NAME) + "\n");
			// TODO do we need the port in prod?
			String siteShortName = siteService.getSiteShortName(actionedUponNodeRef);
			bodyText.append(sysAdminParams.getShareProtocol() + "://" + sysAdminParams.getShareHost() + ":"
					+ sysAdminParams.getSharePort() + "/"+ sysAdminParams.getShareContext() +((siteShortName == null)?""
					:"/page/site/" + siteShortName) + "/document-details?nodeRef=" + actionedUponNodeRef.getStoreRef() +
					"/" + actionedUponNodeRef.getId() + "\n\n");
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