// services/questionService.js
import prisma from '../config/prisma.js';
import { getLogger } from '../config/logger.js';
import { sendEmail } from '../config/email.js';

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
        const productUrl = `${process.env.FRONTEND_URL}/products/${productId}`;
        await sendEmail({
          to: product.seller.email,
          subject: `New question about your product: ${product.title}`,
          html: `
            <h2>New Question from Buyer</h2>
            <p>Hello ${product.seller.fullName},</p>
            <p>Someone asked a question about your product <strong>${product.title}</strong>:</p>
            <blockquote style="border-left: 3px solid #ccc; padding-left: 15px; margin: 20px 0;">
              ${content}
            </blockquote>
            <p>Asked by: <strong>${question.asker.fullName}</strong></p>
            <p><a href="${productUrl}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">View Product and Answer</a></p>
            <p>Best regards,<br>Auctio Team</p>
          `
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

      // Send email notification to asker
      try {
        const productUrl = `${process.env.FRONTEND_URL}/products/${question.product.id}`;
        await sendEmail({
          to: question.asker.email,
          subject: `Your question about "${question.product.title}" has been answered`,
          html: `
            <h2>Your Question Has Been Answered</h2>
            <p>Hello ${question.asker.fullName},</p>
            <p>The seller has answered your question about <strong>${question.product.title}</strong>:</p>
            <blockquote style="border-left: 3px solid #ccc; padding-left: 15px; margin: 20px 0; background: #f9f9f9; padding: 10px 15px;">
              <strong>Your question:</strong><br>
              ${question.content}
            </blockquote>
            <blockquote style="border-left: 3px solid #4CAF50; padding-left: 15px; margin: 20px 0; background: #f0f8f0; padding: 10px 15px;">
              <strong>Answer:</strong><br>
              ${content}
            </blockquote>
            <p><a href="${productUrl}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">View Product</a></p>
            <p>Best regards,<br>Auctio Team</p>
          `
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

