import React, { useRef, useState } from "react";
import { Heading, Button } from "grommet";
import { functions } from "firebase/app";

const Admin = () => {
  const [pending, setPending] = useState(false);
  const { current: moveWishlystItems } = useRef(functions().httpsCallable("moveAllNestedLystItemsToRoot"));
  const { current: fixCategoryData } = useRef(functions().httpsCallable("fixCategoryData"));

  const move = async () => {
    setPending(true);
    await moveWishlystItems();
    setPending(false);
  };

  const fix = async () => {
    setPending(true);
    await fixCategoryData();
    setPending(false);
  };
  return (
    <div>
      <Heading level={2}>Admin page</Heading>
      <Button disabled={pending} label="Move wishlyst items to root" onClick={move} />
      <Button disabled={pending} label="Fix lyst item categories" onClick={fix} />
    </div>
  );
};

export default Admin;
