import prisma from '../config/prisma.js';
import bcrypt from 'bcrypt';


export class UserModel {
    /**
     * Create a new user
     */
    static async create(userData) {
        const hashedPassword = await bcrypt.hash(userData.password, 10);

        return prisma.user.create({
            data: {
                ...userData,
                password: hashedPassword
            }
        });
    }

    /**
     * Find user by email
     */
    static async findByEmail(email) {
        return prisma.user.findUnique({
            where: { email }
        });
    }

    /**
     * Find user by ID
     */
    static async findById(id) {
        return prisma.user.findUnique({
            where: { id },
            include: {
                products: true,
                bids: true,
                watchList: true
            }
        });
    }

    /**
     * Update user profile
     */
    static async update(id, updateData) {
        return prisma.user.update({
            where: { id },
            data: updateData
        });
    }

    /**
     * Verify user password
     */
    static async verifyPassword(plainPassword, hashedPassword) {
        return bcrypt.compare(plainPassword, hashedPassword);
    }

    /**
     * Get users by role
     */
    static async findByRole(role) {
        return prisma.user.findMany({
            where: { role }
        });
    }

    /**
     * Update user rating (+1 or -1)
     */
    static async updateRating(userId, isPositive) {
        const updateData = isPositive
            ? { positiveRatings: { increment: 1 } }
            : { negativeRatings: { increment: 1 } };

        return prisma.user.update({
            where: { id: userId },
            data: updateData
        });
    }

    /**
     * Request seller upgrade
     */
    static async requestUpgrade(userId) {
        return prisma.user.update({
            where: { id: userId },
            data: {
                upgradeRequested: true,
                upgradeStatus: 'PENDING',
                upgradeRequestedAt: new Date()
            }
        });
    }

    /**
     * Approve/Reject upgrade request
     */
    static async handleUpgradeRequest(userId, approved) {
        return prisma.user.update({
            where: { id: userId },
            data: {
                upgradeStatus: approved ? 'APPROVED' : 'REJECTED',
                role: approved ? 'SELLER' : undefined
            }
        });
    }

    /**
     * Verify email
     */
    static async verifyEmail(userId) {
        return prisma.user.update({
            where: { id: userId },
            data: {
                isVerified: true,
                verificationToken: null
            }
        });
    }

    /**
     * Get all pending upgrade requests
     */
    static async getPendingUpgradeRequests() {
        return prisma.user.findMany({
            where: {
                upgradeRequested: true,
                upgradeStatus: 'PENDING'
            },
            orderBy: {
                upgradeRequestedAt: 'asc'
            }
        });
    }
}

export default UserModel;
