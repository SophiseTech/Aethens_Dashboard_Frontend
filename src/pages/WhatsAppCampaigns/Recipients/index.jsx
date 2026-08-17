import React from "react";
import RecipientGroupList from "./RecipientGroupList";
import RecipientGroupForm from "./RecipientGroupForm";

export default function RecipientsTab() {
  return (
    <div>
      <RecipientGroupList />
      <RecipientGroupForm />
    </div>
  );
}
