import { User } from "../models/User.js";
import { Resume } from "../models/Resume.js";

export async function getUsersWithResumeCounts() {
  const totalUsers = await User.countDocuments();
  const usersRaw = await User.aggregate([
    { $sort: { createdAt: -1 } },
    {
      $lookup: {
        from: Resume.collection.name,
        localField: "_id",
        foreignField: "userId",
        as: "_resumes",
      },
    },
    {
      $project: {
        _id: 0,
        id: { $toString: "$_id" },
        email: 1,
        name: 1,
        createdAt: 1,
        resumeCount: { $size: "$_resumes" },
      },

      
    },
  ]);
  const totalResumes = await Resume.countDocuments();
  return { totalUsers, totalResumes, users: usersRaw };
}
