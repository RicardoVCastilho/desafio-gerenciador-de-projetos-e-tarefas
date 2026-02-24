import { Schema, model, Document, Types } from "mongoose";
import { ProjectStatus } from "../types/project.status";

export interface IProject extends Document {
  title: string;
  description?: string;
  status: ProjectStatus;
  user: Types.ObjectId;
}

const projectSchema = new Schema<IProject>(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    status: {
      type: String,
      enum: ["ativo", "concluido"],
      default: "ativo",
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Project = model<IProject>("Project", projectSchema);