'use client';

import { updateCardOrder } from '@/actions/update-card-order';
import { updateListOrder } from '@/actions/update-list-order';
import { useAction } from '@/hooks/use-action';
import { ListWithCards } from '@/types';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { ListForm } from './list-form';
import { ListItem } from './list-item';

interface ListContainerProps {
  data: ListWithCards[];
  boardId: string;
}

function reorder<T>(list: T[], startIndex: number, endIndex: number) {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
}
export const ListContainer = ({ data, boardId }: ListContainerProps) => {
  const [orderedData, setOrderedData] = useState<ListWithCards[]>(data);
  const { execute: executeUpdateListOrder } = useAction(updateListOrder, {
    onSuccess: () => {
      toast.success('List reordered successfully');
    },
    onError: error => {
      toast.error(error);
    },
  });

  const { execute: executeUpdateCardOrder } = useAction(updateCardOrder, {
    onSuccess: () => {
      toast.success('Card reordered successfully');
    },
    onError: error => {
      toast.error(error);
    },
  });

  useEffect(() => {
    setOrderedData(data);
  }, [data]);

  const onDragEnd = (result: any) => {
    const { destination, source, type } = result;

    if (!destination) {
      return;
    }

    // if user dropped an item in the same position

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    // user moves a list
    if (type === 'list') {
      const items = reorder(orderedData, source.index, destination.index).map(
        (item, index) => ({ ...item, order: index })
      );

      setOrderedData(items);
      executeUpdateListOrder({
        items,
        boardId,
      });
    }

    // user moves a card

    if (type === 'card') {
      let newOrderedData = [...orderedData];

      // source and destination list
      const sourceList = newOrderedData.find(
        list => list.id === source.droppableId
      );
      const destinationList = newOrderedData.find(
        list => list.id === destination.droppableId
      );

      if (!sourceList || !destinationList) {
        return;
      }

      // check if cards exists on the source list
      if (!sourceList.cards) {
        sourceList.cards = [];
      }

      // check if card exists on the destination list
      if (!destinationList.cards) {
        destinationList.cards = [];
      }

      // moving the card in the same list
      if (source.droppableId === destination.droppableId) {
        const reorderedCards = reorder(
          sourceList.cards,
          source.index,
          destination.index
        );
        reorderedCards.forEach((card, index) => {
          card.order = index;
        });

        sourceList.cards = reorderedCards;
        setOrderedData(newOrderedData);

        executeUpdateCardOrder({
          items: reorderedCards,
          boardId,
        });
      } else {
        // moving the card to another list
        const [movedCard] = sourceList.cards.splice(source.index, 1);

        // assign the new listId to the moved card
        movedCard.listId = destinationList.id;
        // add card to the destination list
        destinationList.cards.splice(destination.index, 0, movedCard);

        sourceList.cards.forEach((card, index) => {
          card.order = index;
        });

        // update the order for each card in the destination list
        destinationList.cards.forEach((card, index) => {
          card.order = index;
        });

        setOrderedData(newOrderedData);

        // TODO: Trigger server action
        executeUpdateCardOrder({
          items: destinationList.cards,
          boardId,
        });
      }
    }
  };
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId='lists' type='list' direction='horizontal'>
        {provided => (
          <ol
            {...provided.droppableProps}
            ref={provided.innerRef}
            className='flex gap-3 h-full'
          >
            {orderedData.map((list, index) => (
              <ListItem key={list.id} index={index} data={list} />
            ))}
            {provided.placeholder}
            <ListForm />
            <div className='flex-shrink-0 w-1' />
          </ol>
        )}
      </Droppable>
    </DragDropContext>
  );
};
