import React from "react";
import { Template } from "meteor/templating";
import { useParams, useSearchParams } from "/imports/ui/hooks/react-meteor-router";

import { Avatar } from "../avatar";

const Components: Record<string, React.FC<any>> = {
  // Add here components that should be available by cy.mount(...) for testing
  Avatar,
};

export function ComponentTest() {
  const params = useParams();
  const searchParams = useSearchParams();

  const Component = Components[params?.name || ""];

  if (!Component) {
    throw new Error(
      `Could not mount component "${params.name}" did you have it registred in ComponentTest?`,
    );
  }

  return <Component {...JSON.parse(searchParams?.args || "{}")} />;
}

// for Blaze

import "./template.html";

Template.registerHelper("ComponentTest", () => ComponentTest);
