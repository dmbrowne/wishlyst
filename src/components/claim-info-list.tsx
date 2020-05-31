import React, { FC, useState, useEffect } from "react";
import { Box, Text, Button } from "grommet";
import Avatar from "./avatar";
import { ILystItem, IBuyer } from "../@types";
import { Add, Subtract } from "grommet-icons";
import { IconButton } from "gestalt";
import { useDispatch } from "react-redux";
import { db } from "../firebase";
import { fetchBuyerSuccess, deleteBuyerSuccess, updateBuyerSuccess } from "../store/lyst-items";
import { useStateSelector } from "../store";

interface Props {
  buyer: IBuyer;
  onDelete?: () => void;
  showCount: boolean;
  maxCount: number;
  onUpdateCount: (count: number) => any;
}

interface IClaimInfoListProps extends Pick<Props, "showCount"> {
  lystItem: ILystItem;
  onUpdateCount: (buyId: string, count: number) => any;
  onDeleteBuyer?: (buyId: string) => any;
}

const ClaimInfoList: FC<IClaimInfoListProps> = ({ lystItem, onUpdateCount, onDeleteBuyer, ...props }) => {
  const dispatch = useDispatch();
  const lystItemId = lystItem.id;
  const buyerIds = useStateSelector(state => state.lystItems.buyersByLystItemId[lystItemId] || []);
  const allBuyers = useStateSelector(state => state.lystItems.buyers);
  const buyers = buyerIds.reduce((accum, buyerId) => {
    const buyer = allBuyers[buyerId] ? { ...allBuyers[buyerId], id: buyerId } : undefined;
    return !!buyer ? [...accum, buyer] : accum;
  }, [] as (IBuyer & { id: string })[]);
  const [fetched, setFetched] = useState(false);

  useEffect(() => {
    db.collection(`lystItems/${lystItemId}/buyers`).onSnapshot(querySnapshot => {
      querySnapshot.docChanges().forEach(({ doc, type }) => {
        let action;

        if (type === "added") {
          action = fetchBuyerSuccess(lystItemId, { id: doc.id, ...(doc.data() as IBuyer) });
        }
        if (type === "modified") {
          action = updateBuyerSuccess(doc.id, doc.data() as IBuyer);
        }
        if (type === "removed") {
          action = deleteBuyerSuccess(lystItemId, doc.id);
        }

        if (action) dispatch(action);
      });
      setFetched(true);
    });
  }, [lystItemId, dispatch]);

  if (!fetched) {
    return null;
  }

  return (
    <Box>
      {buyers.map(buyDetails => {
        const { id } = buyDetails;
        return (
          <BuyerClaim
            buyer={buyDetails}
            maxCount={lystItem.quantity}
            onUpdateCount={count => onUpdateCount(id, count)}
            onDelete={onDeleteBuyer ? () => onDeleteBuyer(id) : undefined}
            {...props}
          />
        );
      })}
    </Box>
  );
};

const BuyerClaim: FC<Props> = ({ buyer, maxCount, onUpdateCount, showCount, onDelete }) => {
  const { displayName, thumbnailUrl, count, userId } = buyer;
  const onIncrement = () => {
    let newCount = buyer.count + 1;
    newCount = newCount > maxCount ? maxCount : newCount;
    onUpdateCount(newCount);
  };
  const onDecrement = () => {
    let newCount = buyer.count - 1;
    newCount = newCount < 0 ? 0 : newCount;
    onUpdateCount(newCount);
  };
  return (
    <Box key={userId} pad={{ left: "none", vertical: "xxsmall", right: "xxsmall" }} border="between">
      <Box direction="row" gap="small" align="center">
        <Avatar name={displayName} imgSrc={thumbnailUrl} />
        <Box justify="between" align="center" direction="row" style={{ flex: 1 }}>
          <Text children={displayName} as="div" />
          <Box direction="row" gap="small" align="center">
            {onDecrement && showCount && (
              <Box round="full" background="black">
                <Button icon={<Subtract size="small" />} onClick={onDecrement} />
              </Box>
            )}
            {onIncrement && showCount && (
              <Box round="full" background="black">
                <Button icon={<Add size="small" />} onClick={onIncrement} />
              </Box>
            )}
            {showCount && <Box pad="small" align="center" width="50px" border children={<Text>{count}</Text>} />}
            {onDelete && <IconButton accessibilityLabel="Remove buyer" icon="trash-can" onClick={onDelete} />}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default ClaimInfoList;
