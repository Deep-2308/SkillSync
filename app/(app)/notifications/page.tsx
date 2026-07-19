import { Metadata } from "next";
import { NotificationsClient } from "./NotificationsClient";

export const metadata: Metadata = {
  title: "Notifications | SkillSync",
};

export default function NotificationsPage() {
  return <NotificationsClient />;
}
