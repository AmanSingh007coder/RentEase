import Activity from "@/models/Activity";

export async function logActivity({ propertyId, recipientId, senderId, title, desc, category }: any) {
  try {
    await Activity.create({
      propertyId,
      recipientId,
      senderId,
      title,
      desc,
      category
    });
  } catch (err) {
    console.error("Failed to log activity:", err);
  }
}