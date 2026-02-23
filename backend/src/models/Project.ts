import { Schema, model} from "mongoose"

const projectSchema = new Schema (
    {
        title: {
            type: String,
            required: true
        },
        description: {
            type: String,
        },
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
    },
    {
        timestamps: true,
    }
)

export const Project = model("Project", projectSchema)