// services/questionService.js
import prisma from '../config/prisma.js';
import { getLogger } from '../config/logger.js';
import { sendEmail } from '../config/email.js';
import emailNotificationService from './emailNotificationService.js';

const logger = getLogger('QuestionService');

class QuestionService {
  /**
   * Ask a question about a product
   */
  async askQuestion(productId, askerId, content) {
    try {
      // Check if product exists
      const product = await prisma.product.findUnique({
        where: { id: productId },
        include: {
          seller: {
            select: {
              id: true,
              email: true,
              fullName: true
            }
          }
        }
      });

      if (!product) {
        throw new Error('Product not found');
      }

      const question = await prisma.question.create({
        data: {
          productId,
          askerId,
          content
        },
        include: {
          asker: {
            select: {
              id: true,
              fullName: true,
              email: true
            }
          }
        }
      });

      // Send email notification to seller
      try {
        emailNotificationService.notifyQuestionAsked({
          product: {
            id: product.id,
            title: product.title,
            seller: product.seller
          },
          asker: question.asker,
          question: content
        });
      } catch (emailError) {
        logger.error('Failed to send email notification:', emailError);
        // Don't fail the request if email fails
      }

      return question;
    } catch (error) {
      logger.error('Error asking question:', error);
      throw error;
    }
  }

  /**
   * Answer a question (seller only)
   */
  async answerQuestion(questionId, sellerId, content) {
    try {
      const question = await prisma.question.findUnique({
        where: { id: questionId },
        include: {
          product: {
            select: {
              sellerId: true,
              title: true
            }
          },
          asker: {
            select: {
              email: true,
              fullName: true
            }
          }
        }
      });

      if (!question) {
        throw new Error('Question not found');
      }

      if (question.product.sellerId !== sellerId) {
        throw new Error('Only the seller can answer this question');
      }

      // Check if already answered
      const existingAnswer = await prisma.answer.findUnique({
        where: { questionId }
      });

      if (existingAnswer) {
        throw new Error('Question already answered');
      }

      const answer = await prisma.answer.create({
        data: {
          questionId,
          sellerId,
          content
        },
        include: {
          seller: {
            select: {
              id: true,
              fullName: true
            }
          }
        }
      });

      // Send email notifications to asker, all bidders, and all users who asked questions
      try {
        // Get product details
        const product = await prisma.product.findUnique({
          where: { id: question.product.id },
          select: {
            id: true,
            title: true
          }
        });

        // Get all bidders for this product (unique)
        const bidders = await prisma.bid.findMany({
          where: { productId: question.product.id },
          select: {
            bidder: {
              select: {
                id: true,
                fullName: true,
                email: true
              }
            }
          },
          distinct: ['bidderId']
        });

        // Get all users who asked questions (unique)
        const questioners = await prisma.question.findMany({
          where: { productId: question.product.id },
          select: {
            asker: {
              select: {
                id: true,
                fullName: true,
                email: true
              }
            }
          },
          distinct: ['askerId']
        });

        // Combine all recipients (deduplicate by id)
        const recipientMap = new Map();

        // Add the asker (always included)
        recipientMap.set(question.asker.id, {
          id: question.asker.id,
          fullName: question.asker.fullName,
          email: question.asker.email
        });

        // Add all bidders
        bidders.forEach(b => {
          if (b.bidder.email) {
            recipientMap.set(b.bidder.id, b.bidder);
          }
        });

        // Add all questioners
        questioners.forEach(q => {
          if (q.asker.email) {
            recipientMap.set(q.asker.id, q.asker);
          }
        });

        const recipients = Array.from(recipientMap.values());

        emailNotificationService.notifyQuestionAnswered({
          product,
          question: {
            askerId: question.askerId,
            content: question.content
          },
          answer: {
            content
          },
          recipients
        });
      } catch (emailError) {
        logger.error('Failed to send email notification:', emailError);
      }

      return answer;
    } catch (error) {
      logger.error('Error answering question:', error);
      throw error;
    }
  }

  /**
   * Get questions for a product
   */
  async getProductQuestions(productId) {
    try {
      const questions = await prisma.question.findMany({
        where: { productId },
        orderBy: { createdAt: 'desc' },
        include: {
          asker: {
            select: {
              id: true,
              fullName: true
            }
          },
          answer: {
            include: {
              seller: {
                select: {
                  id: true,
                  fullName: true
                }
              }
            }
          }
        }
      });

      return questions;
    } catch (error) {
      logger.error('Error getting product questions:', error);
      throw error;
    }
  }
}

export default new QuestionService();

