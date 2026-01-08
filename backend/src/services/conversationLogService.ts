import ConversationLog, { IConversationLog, IConversationTurn } from '../models/ConversationLog';

/**
 * Conversation Logging Service
 * Handles all conversation tracking and observability
 */
class ConversationLogService {
  /**
   * Start a new conversation session
   */
  async startConversation(
    sessionId: string,
    metadata?: { userAgent?: string; ipAddress?: string }
  ): Promise<IConversationLog> {
    try {
      const log = new ConversationLog({
        sessionId,
        startTime: new Date(),
        status: 'active',
        turns: [],
        bookingSuccess: false,
        errorCount: 0,
        metadata
      });

      await log.save();
      console.log(`[ConversationLog] Started session: ${sessionId}`);
      return log;
    } catch (error) {
      console.error('[ConversationLog] Error starting conversation:', error);
      throw error;
    }
  }

  /**
   * Add a conversation turn (user or agent message)
   */
  async addTurn(
    sessionId: string,
    turn: Omit<IConversationTurn, 'timestamp'>
  ): Promise<void> {
    try {
      const log = await ConversationLog.findOne({ sessionId });

      if (!log) {
        console.warn(`[ConversationLog] Session not found: ${sessionId}`);
        return;
      }

      log.turns.push({
        ...turn,
        timestamp: new Date()
      });

      // Increment error count if turn has error
      if (turn.error) {
        log.errorCount += 1;
      }

      await log.save();
    } catch (error) {
      console.error('[ConversationLog] Error adding turn:', error);
    }
  }

  /**
   * Log user message
   */
  async logUserMessage(
    sessionId: string,
    text: string,
    intent?: string,
    confidence?: number,
    state?: string
  ): Promise<void> {
    await this.addTurn(sessionId, {
      speaker: 'user',
      text,
      intent,
      confidence,
      state
    });
  }

  /**
   * Log agent response
   */
  async logAgentResponse(
    sessionId: string,
    text: string,
    state?: string,
    error?: string
  ): Promise<void> {
    await this.addTurn(sessionId, {
      speaker: 'agent',
      text,
      state,
      error
    });
  }

  /**
   * Complete a conversation
   */
  async completeConversation(
    sessionId: string,
    bookingId?: string,
    bookingSuccess: boolean = false,
    finalState?: string
  ): Promise<void> {
    try {
      const log = await ConversationLog.findOne({ sessionId });

      if (!log) {
        console.warn(`[ConversationLog] Session not found: ${sessionId}`);
        return;
      }

      const endTime = new Date();
      const duration = endTime.getTime() - log.startTime.getTime();

      log.endTime = endTime;
      log.status = 'completed';
      log.bookingId = bookingId;
      log.bookingSuccess = bookingSuccess;
      log.finalState = finalState;

      if (log.metadata) {
        log.metadata.duration = duration;
      } else {
        log.metadata = { duration };
      }

      await log.save();
      console.log(`[ConversationLog] Completed session: ${sessionId}, success: ${bookingSuccess}`);
    } catch (error) {
      console.error('[ConversationLog] Error completing conversation:', error);
    }
  }

  /**
   * Mark conversation as abandoned
   */
  async abandonConversation(sessionId: string, reason?: string): Promise<void> {
    try {
      const log = await ConversationLog.findOne({ sessionId });

      if (!log) {
        return;
      }

      const endTime = new Date();
      const duration = endTime.getTime() - log.startTime.getTime();

      log.endTime = endTime;
      log.status = 'abandoned';

      if (log.metadata) {
        log.metadata.duration = duration;
      } else {
        log.metadata = { duration };
      }

      // Log abandonment reason
      if (reason) {
        await this.logAgentResponse(sessionId, reason, 'abandoned', 'User abandoned conversation');
      }

      await log.save();
      console.log(`[ConversationLog] Abandoned session: ${sessionId}`);
    } catch (error) {
      console.error('[ConversationLog] Error abandoning conversation:', error);
    }
  }

  /**
   * Mark conversation as error
   */
  async errorConversation(sessionId: string, errorMessage: string): Promise<void> {
    try {
      const log = await ConversationLog.findOne({ sessionId });

      if (!log) {
        return;
      }

      const endTime = new Date();
      const duration = endTime.getTime() - log.startTime.getTime();

      log.endTime = endTime;
      log.status = 'error';

      if (log.metadata) {
        log.metadata.duration = duration;
      } else {
        log.metadata = { duration };
      }

      await this.logAgentResponse(sessionId, errorMessage, 'error', errorMessage);
      await log.save();

      console.error(`[ConversationLog] Error in session: ${sessionId}`);
    } catch (error) {
      console.error('[ConversationLog] Error logging error state:', error);
    }
  }

  /**
   * Get conversation by session ID
   */
  async getConversation(sessionId: string): Promise<IConversationLog | null> {
    try {
      return await ConversationLog.findOne({ sessionId });
    } catch (error) {
      console.error('[ConversationLog] Error getting conversation:', error);
      return null;
    }
  }

  /**
   * Get recent conversations (for admin dashboard)
   */
  async getRecentConversations(limit: number = 50): Promise<IConversationLog[]> {
    try {
      return await ConversationLog.find()
        .sort({ createdAt: -1 })
        .limit(limit);
    } catch (error) {
      console.error('[ConversationLog] Error getting recent conversations:', error);
      return [];
    }
  }

  /**
   * Get conversations by status
   */
  async getConversationsByStatus(
    status: 'active' | 'completed' | 'abandoned' | 'error',
    limit: number = 50
  ): Promise<IConversationLog[]> {
    try {
      return await ConversationLog.find({ status })
        .sort({ createdAt: -1 })
        .limit(limit);
    } catch (error) {
      console.error('[ConversationLog] Error getting conversations by status:', error);
      return [];
    }
  }

  /**
   * Get conversations by booking ID
   */
  async getConversationsByBookingId(bookingId: string): Promise<IConversationLog[]> {
    try {
      return await ConversationLog.find({ bookingId }).sort({ createdAt: -1 });
    } catch (error) {
      console.error('[ConversationLog] Error getting conversations by booking ID:', error);
      return [];
    }
  }

  /**
   * Get conversation statistics
   */
  async getStatistics(): Promise<{
    total: number;
    completed: number;
    abandoned: number;
    error: number;
    successRate: number;
    averageDuration: number;
  }> {
    try {
      const total = await ConversationLog.countDocuments();
      const completed = await ConversationLog.countDocuments({ status: 'completed' });
      const abandoned = await ConversationLog.countDocuments({ status: 'abandoned' });
      const error = await ConversationLog.countDocuments({ status: 'error' });
      const successful = await ConversationLog.countDocuments({ bookingSuccess: true });

      const successRate = total > 0 ? (successful / total) * 100 : 0;

      // Calculate average duration
      const logs = await ConversationLog.find({ 'metadata.duration': { $exists: true } });
      const totalDuration = logs.reduce((sum, log) => sum + (log.metadata?.duration || 0), 0);
      const averageDuration = logs.length > 0 ? totalDuration / logs.length / 1000 : 0; // in seconds

      return {
        total,
        completed,
        abandoned,
        error,
        successRate: Math.round(successRate * 100) / 100,
        averageDuration: Math.round(averageDuration * 100) / 100
      };
    } catch (error) {
      console.error('[ConversationLog] Error getting statistics:', error);
      return {
        total: 0,
        completed: 0,
        abandoned: 0,
        error: 0,
        successRate: 0,
        averageDuration: 0
      };
    }
  }
}

export default new ConversationLogService();
