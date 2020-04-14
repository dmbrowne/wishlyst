import React, { useState, useEffect, useContext, FC, Ref, ReactNode } from "react";
import useGuestClaimedItems from "../hooks/use-guest-claimed-items";
import { GuestProfileContext } from "../context/guest-profile";
import { InfiniteScroll } from "grommet";
import { IClaimedItem } from "../store/types";

interface IProps {
  lystId: string;
  loadLimit: number;
  children?: <E extends any>(item: IClaimedItem, index: number, ref: Ref<E>) => ReactNode;
  inifiniteScroll?: boolean;
  onLoadSet?: (items: string[]) => any;
}

const GuestClaimedItems: FC<IProps> = ({ lystId, loadLimit, children, inifiniteScroll, onLoadSet }) => {
  const { guestProfile } = useContext(GuestProfileContext);
  const { getLystItemsByLyst } = useGuestClaimedItems();
  const [allClaimedItems, setAllClaimedItems] = useState<IClaimedItem[]>([]);
  const [viewableClaimedItems, setViewableClaimedItems] = useState<IClaimedItem[]>([]);

  const hasMore = viewableClaimedItems.length < allClaimedItems.length;

  useEffect(() => {
    const claimed = getLystItemsByLyst(lystId);
    setAllClaimedItems(claimed || []);
  }, [guestProfile, lystId]);

  const getMore = () => {
    const lastItemIdx = viewableClaimedItems.length - 1;
    if (lastItemIdx) {
      const newClaimedItems = allClaimedItems.slice(lastItemIdx, lastItemIdx + loadLimit);
      if (onLoadSet) onLoadSet(newClaimedItems.map(({ lystItemRef }) => lystItemRef));
      setViewableClaimedItems([...viewableClaimedItems, ...newClaimedItems]);
    } else {
      const clamedItems = allClaimedItems.slice(0, loadLimit - 9);
      if (onLoadSet) onLoadSet(clamedItems.map(({ lystItemRef }) => lystItemRef));
      setViewableClaimedItems(clamedItems);
    }
  };

  return (
    <InfiniteScroll items={viewableClaimedItems} onMore={hasMore && inifiniteScroll ? () => getMore() : undefined} children={children} />
  );
};

export default GuestClaimedItems;
