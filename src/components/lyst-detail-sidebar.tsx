import React, { FC, useState, useContext, useRef } from "react";
import { ThemeContext, Layer, Heading, Box, AccordionPanel, Text, Button, Accordion, BoxTypes, RadioButton } from "grommet";
import { UnorderedList, Grid, FormDown, FormUp, Close, FormClose, Checkmark } from "grommet-icons";
import { useTheme } from "styled-components";
import { setClaimFilter } from "../store/lysts";
import { CategoriesContext } from "../context/categories";
import { useDispatch } from "react-redux";
import { useStateSelector } from "../store";
import { firestore } from "firebase/app";

interface IProps {
  lystId: string;
  filteredCategories: string[];
  onClose: () => void;
  onSelectCategory: (categoryId: string) => void;
}

const PanelHeader: FC<{ active: boolean; label: string }> = ({ active, label }) => (
  <Box direction="row" justify="between" margin={{ bottom: active ? "small" : "none" }} pad="small">
    <Text>{label}</Text>
    {active ? <FormUp /> : <FormDown />}
  </Box>
);

const PanelContainer = (props: BoxTypes) => {
  const { dark } = useTheme();
  const background = dark ? "#1b1a1a" : "light-1";
  const margin = { top: "none", horizontal: "medium", bottom: "medium" };
  return <Box background={background} margin={margin} style={{ borderRadius: 8 }} {...props} />;
};

const LystDetailSidebar: FC<IProps> = ({ onClose, lystId, onSelectCategory, filteredCategories }) => {
  const { current: db } = useRef(firestore());
  const dispatch = useDispatch();
  const { dark } = useTheme();
  const lystRef = db.doc(`/lysts/${lystId}`);
  const [activePanels, setActivePanels] = useState<number[]>([]);
  const { claimFilter } = useStateSelector(({ lysts }) => lysts);
  const { account } = useStateSelector(({ auth }) => auth);
  const { categories } = useContext(CategoriesContext);

  const toggleClaimFilter = (filter: "all" | "me" | "unclaimed" | "claimed") => {
    dispatch(setClaimFilter(filter === "all" ? false : filter));
  };

  const deleteCategory = (categoryId: string) => {
    const confirm = window.confirm("Are you sure you want to delete this category?");
    if (confirm)
      lystRef
        .collection("categories")
        .doc(categoryId)
        .delete();
  };

  const themeValues = {
    layer: {
      background: dark ? "#000" : "white",
    },
    accordion: {
      border: {
        color: "transparent",
      },
    },
  };

  return (
    <ThemeContext.Extend value={themeValues}>
      <Layer position="right" full="vertical" responsive={false} style={{ width: "80%", maxWidth: 500, borderRadius: 0 }}>
        <Box background={dark ? "dark-1" : "light-1"} direction="row">
          <Button onClick={onClose} icon={<FormClose />} />
          <Box flex="grow" pad="small">
            <Heading textAlign="center" margin="none" level={4} children="Display and filter" />
          </Box>
        </Box>

        <Accordion onActive={setActivePanels} activeIndex={activePanels} margin={{ top: "large" }} multiple>
          <PanelContainer>
            <AccordionPanel header={<PanelHeader active={activePanels.includes(0)} label="Layout" />}>
              <Box pad="small" gap="small" direction="row" align="center">
                <UnorderedList size="16px" />
                <Text size="small">List</Text>
              </Box>
              <Box pad="small" gap="small" direction="row" align="center">
                <Grid size="16px" />
                <Text size="small">Grid</Text>
              </Box>
            </AccordionPanel>
          </PanelContainer>
          <PanelContainer>
            <AccordionPanel header={<PanelHeader active={activePanels.includes(1)} label="Categories" />}>
              {categories.map(category => {
                const onClick = () => onSelectCategory(category.id);
                const active = filteredCategories.includes(category.id);
                return (
                  <Box key={category.id} pad="small" gap="small" direction="row" align="center" onClick={onClick}>
                    {active && <Checkmark size="small" />}
                    <Text size="small">{category.label}</Text>
                  </Box>
                );
              })}
            </AccordionPanel>
          </PanelContainer>
          <PanelContainer>
            <AccordionPanel header={<PanelHeader active={activePanels.includes(1)} label="Display" />}>
              <Box pad="small" gap="small" direction="row" align="center" onClick={() => toggleClaimFilter("all")}>
                <RadioButton label={<Text size="small">All items</Text>} name="all-items" checked={!claimFilter} />
              </Box>
              <Box pad="small" gap="small" direction="row" align="center" onClick={() => toggleClaimFilter("claimed")}>
                <RadioButton
                  label={<Text size="small">Only claimed Items</Text>}
                  name="claimed-items"
                  checked={claimFilter === "claimed"}
                />
              </Box>
              <Box pad="small" gap="small" direction="row" align="center" onClick={account ? () => toggleClaimFilter("me") : undefined}>
                <RadioButton
                  label={
                    <Text size="small" color={!account ? (dark ? "dark-1" : "light-2") : undefined}>
                      Items claimed by me {!account && " (you need to login to use this filter)"}
                    </Text>
                  }
                  name="my-claimed-items"
                  checked={claimFilter === "me"}
                />
              </Box>
              <Box pad="small" gap="small" direction="row" align="center" onClick={() => toggleClaimFilter("unclaimed")}>
                <RadioButton
                  label={<Text size="small">Only unclaimed Items</Text>}
                  name="all-items"
                  checked={claimFilter === "unclaimed"}
                />
              </Box>
            </AccordionPanel>
          </PanelContainer>
        </Accordion>
      </Layer>
    </ThemeContext.Extend>
  );
};

export default LystDetailSidebar;
