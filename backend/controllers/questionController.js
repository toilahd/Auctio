// controllers/questionController.js
import questionService from '../services/questionService.js';
import { getLogger } from '../config/logger.js';

const logger = getLogger('QuestionController');

class QuestionController {
  /**
   * POST /api/questions
   * Ask a question about a product
   */
  async askQuestion(req, res) {
    try {
      const { productId, content } = req.body;
      const askerId = req.user.id;

      if (!productId || !content) {
        return res.status(400).json({
          success: false,
          message: 'Product ID and question content are required'
        });
      }

      if (content.trim().length < 5) {
        return res.status(400).json({
          success: false,
          message: 'Question must be at least 5 characters long'
        });
      }

      const question = await questionService.askQuestion(productId, askerId, content);

      return res.status(201).json({
        success: true,
        data: question,
        message: 'Question submitted. Seller will be notified via email.'
      });
    } catch (error) {
      logger.error('Error in askQuestion:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to submit question'
      });
    }
  }

  /**
   * POST /api/questions/:questionId/answer
   * Answer a question (seller only)
   */
  async answerQuestion(req, res) {
    try {
      const { questionId } = req.params;
      const { content } = req.body;
      const sellerId = req.user.id;

      if (!content) {
        return res.status(400).json({
          success: false,
          message: 'Answer content is required'
        });
      }

      if (content.trim().length < 5) {
        return res.status(400).json({
          success: false,
          message: 'Answer must be at least 5 characters long'
        });
      }

      const answer = await questionService.answerQuestion(questionId, sellerId, content);

      return res.status(201).json({
        success: true,
        data: answer,
        message: 'Answer posted. Asker will be notified via email.'
      });
    } catch (error) {
      logger.error('Error in answerQuestion:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to post answer'
      });
    }
  }

  /**
   * GET /api/questions/product/:productId
   * Get all questions for a product
   */
  async getProductQuestions(req, res) {
    try {
      const { productId } = req.params;

      const questions = await questionService.getProductQuestions(productId);

      return res.status(200).json({
        success: true,
        data: questions
      });
    } catch (error) {
      logger.error('Error in getProductQuestions:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to get questions'
      });
    }
  }
}

export default new QuestionController();

