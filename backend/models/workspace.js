
import mongoose, { Schema } from "mongoose";

const workspaceModel = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  description: { 
    type: String,
    trim: true,
  },
  color: { 
    type: String,
    default: "#FF5733"
  },
  owner: { 
    type: Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  members: [{
   user: {
    type: Schema.Types.ObjectId, 
    ref: "User"
   },
   role: {
    type: String,
    enum: ["admin", "member", "owner", "viewer"],
    default: "member"
   },
   joinedAt: {
    type: Date,
    default: Date.now
   }
  }
],
projects: [{
  type: Schema.Types.ObjectId,
  ref: "Project"
}],
}, { timestamps: true });

const Workspace = mongoose.model("Workspace", workspaceModel);

export default Workspace;