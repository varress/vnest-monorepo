import { useCallback, useRef, useState } from 'react';
import { LayoutRectangle } from 'react-native';

interface CardPosition {
  id: string | number;
  layout: LayoutRectangle;
  centerX: number;
  centerY: number;
}

interface Connection {
  startCardId: string | number;
  endCardId: string | number;
  startPosition: { x: number; y: number };
  endPosition: { x: number; y: number };
}

export function useCardConnections() {
  const [cardPositions, setCardPositions] = useState<Map<string | number, CardPosition>>(new Map());
  const [connections, setConnections] = useState<Connection[]>([]);
  const containerLayoutRef = useRef<LayoutRectangle | null>(null);

  // Register card position
  const registerCardPosition = useCallback((
    cardId: string | number,
    layout: LayoutRectangle,
    containerLayout?: LayoutRectangle
  ) => {
    if (containerLayout) {
      containerLayoutRef.current = containerLayout;
    }

    // Calculate center point of the card for perfect line connections
    const centerX = layout.x + layout.width / 2;
    const centerY = layout.y + layout.height / 2;

    // console.log(`Card ${cardId} registered:`, {
    //   cardId,
    //   layout,
    //   center: { x: centerX, y: centerY },
    //   cardType: cardId.toString().includes('verb') ? 'verb' :
    //             cardId.toString().includes('subject') ? 'subject' : 'object'
    // });

    setCardPositions(prev => {
      const newPositions = new Map(prev);
      newPositions.set(cardId, {
        id: cardId,
        layout,
        centerX,
        centerY,
      });
      return newPositions;
    });
  }, []);

  // Create connection between two cards
  const createConnection = useCallback((
    startCardId: string | number,
    endCardId: string | number
  ) => {
    const startCard = cardPositions.get(startCardId);
    const endCard = cardPositions.get(endCardId);

    if (startCard && endCard) {

      // Calculate connection points on card edges for better visual connection
      const deltaX = endCard.centerX - startCard.centerX;

      // Calculate which edge of the rectangle the line intersects
      const startHalfWidth = startCard.layout.width / 2;
      const endHalfWidth = endCard.layout.width / 2;

      // Calculate intersection with rectangle edges for start card
      let startEdgeX, startEdgeY;

      // Always use horizontal connection for this game layout
      if (deltaX > 0) {
        // Target is to the right - connect from right edge of start card
        startEdgeX = startCard.centerX + startHalfWidth;
        startEdgeY = startCard.centerY;
      } else {
        // Target is to the left - connect from left edge of start card
        startEdgeX = startCard.centerX - startHalfWidth;
        startEdgeY = startCard.centerY;
      }

      // Calculate intersection with rectangle edges for end card
      let endEdgeX, endEdgeY;

      // Always use horizontal connection for this game layout
      if (deltaX > 0) {
        // Start is to the left - connect to left edge of end card
        endEdgeX = endCard.centerX - endHalfWidth;
        endEdgeY = endCard.centerY;
      } else {
        // Start is to the right - connect to right edge of end card
        endEdgeX = endCard.centerX + endHalfWidth;
        endEdgeY = endCard.centerY;
      }

      const startPosition = {
        x: startEdgeX,
        y: startEdgeY,
      };
      
      const endPosition = {
        x: endEdgeX,
        y: endEdgeY,
      };

      const newConnection: Connection = {
        startCardId,
        endCardId,
        startPosition,
        endPosition,
      };

      setConnections(prev => {
        // Remove any existing connections involving these specific cards
        const filtered = prev.filter(conn => 
          !(conn.startCardId === startCardId && conn.endCardId === endCardId) &&
          !(conn.startCardId === endCardId && conn.endCardId === startCardId)
        );
        return [...filtered, newConnection];
      });
    } else {
      console.log('Could not create connection - missing card positions');
    }
  }, [cardPositions]);

  // Remove connection involving a specific card
  const removeConnection = useCallback((cardId: string | number) => {
    setConnections(prev => 
      prev.filter(conn => 
        conn.startCardId !== cardId && conn.endCardId !== cardId
      )
    );
  }, []);

  // Clear all connections
  const clearConnections = useCallback(() => {
    setConnections([]);
  }, []);

  // Get connection between specific cards
  const getConnection = useCallback((
    startCardId: string | number,
    endCardId: string | number
  ): Connection | null => {
    return connections.find(conn => 
      (conn.startCardId === startCardId && conn.endCardId === endCardId) ||
      (conn.startCardId === endCardId && conn.endCardId === startCardId)
    ) || null;
  }, [connections]);

  return {
    cardPositions,
    connections,
    registerCardPosition,
    createConnection,
    removeConnection,
    clearConnections,
    getConnection,
  };
}