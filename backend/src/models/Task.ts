import { Schema, model} from "mongoose"
import { TaskStatus } from "../types/task.status"

const taskSchema = new Schema(
    {
        title: {
            type: String,
            required:true
        },
        description: {
            type: String,
        },
        status: {
            type: String,
            enum: ["a_fazer", "em_progresso", "feito" ],
            default: "a_fazer",
        },
        project: {
            type: Schema.Types.ObjectId,
            ref: "Project",
            required: true,
        },
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    },
    { timestamps: true }
)

export const Task = model("Task", taskSchema)