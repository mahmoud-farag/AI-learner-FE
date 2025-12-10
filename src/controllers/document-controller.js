import { STATUS_CODES } from '../common/index.js';
import { documentService } from '../services/index.js';
import { customErrors } from '../utils/index.js';


const { BadRequestError } = customErrors;

const documentController = {};

documentController.uploadDocument = async (req, res, next) => {
  try {


    if (!req?.body?.title) 
      throw new BadRequestError('Pdf File title not provided in the payload');

    if (!req?.file) 
      throw new BadRequestError('Pdf File not provided in the payload');

    const params = {
      payload: req.body ,
      file: req.file,
      userId: req.user._id,
    };

    const { document } = await documentService.uploadPdfDocument(params);


    res.status(STATUS_CODES.CREATED).json({
      success: true,
      data: { document },
      message: 'Your request under processing....',
    })

  } catch(error) {
    next(error);
  }
}

documentController.getDocuments = async (req, res, next) => {
  try {

    if (!req?.user?._id)
      throw BadRequestError('Action not allowed');
    
    const result = await documentService.getAllDocuments({ userId: req.user._id });

    res.status(STATUS_CODES.OK).json({ success: true, data: { ...result  } });

    
  } catch(error) {

    next(error);

  }
}

documentController.getDocument = async (req, res, next) => {
  try {
    

    
    if (!req?.params?.documentId)
      throw new BadRequestError('Document Id is missing');

    const result = await documentService.getDocument({documentId: req.params.documentId});


    res.status(STATUS_CODES.OK).json({ success: true,  data : { ...result } });

    
  } catch(error) {
    next(error);
  }
}

documentController.deleteDocument = async (req, res, next) => {
  try {
 
    if (!req?.params?.documentId)
      throw new BadRequestError('Document Id is missing');

    await documentService.deleteDocument({documentId: req.params.documentId});


    res.status(STATUS_CODES.OK).json({ success: true, message: 'Document successfully deleted' });

  } catch(error) {
    next(error);
  }
}




export default documentController;