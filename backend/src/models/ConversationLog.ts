import mongoose, { Schema, Document } from 'mongoose';

/**
 * Conversation Turn interface
 */
export interface IConversationTurn {
  timestamp: Date;
  speaker: 'user' | 'agent';
  text: string;
  intent?: string;
  confidence?: number;
  state?: string;
  error?: string;
}

/**
 * Conversation Log interface
 */
export interface IConversationLog extends Document {
  sessionId: string;
  bookingId?: string;
  startTime: Date;
  endTime?: Date;
  status: 'active' | 'completed' | 'abandoned' | 'error';
  turns: IConversationTurn[];
  finalState?: string;
  bookingSuccess: boolean;
  errorCount: number;
  metadata?: {
    userAgent?: string;
    ipAddress?: string;
    duration?: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

/**
 * MongoDB Schema for Conversation Logs
 */
const ConversationLogSchema: Schema = new Schema(
  {
    sessionId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    bookingId: {
      type: String,
      index: true
    },
    startTime: {
      type: Date,
      required: true,
      default: Date.now
    },
    endTime: {
      type: Date
    },
    status: {
      type: String,
      enum: ['active', 'completed', 'abandoned', 'error'],
      default: 'active',
      index: true
    },
    turns: [
      {
        timestamp: {
          type: Date,
          required: true,
          default: Date.now
        },
        speaker: {
          type: String,
          enum: ['user', 'agent'],
          required: true
        },
        text: {
          type: String,
          required: true
        },
        intent: String,
        confidence: Number,
        state: String,
        error: String
      }
    ],
    finalState: String,
    bookingSuccess: {
      type: Boolean,
      default: false
    },
    errorCount: {
      type: Number,
      default: 0
    },
    metadata: {
      userAgent: String,
      ipAddress: String,
      duration: Number
    }
  },
  {
    timestamps: true
  }
);

/**
 * Index for efficient queries
 */
ConversationLogSchema.index({ createdAt: -1 });
ConversationLogSchema.index({ status: 1, createdAt: -1 });

export default mongoose.model<IConversationLog>('ConversationLog', ConversationLogSchema);
