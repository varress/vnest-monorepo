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

    console.log(`Creating connection from ${startCardId} to ${endCardId}`);
    console.log('Start card:', startCard);
    console.log('End card:', endCard);

    if (startCard && endCard) {
      console.log('🎯 Creating connection - Card details:');
      console.log('Start card:', { 
        center: { x: startCard.centerX, y: startCard.centerY },
        layout: startCard.layout 
      });
      console.log('End card:', { 
        center: { x: endCard.centerX, y: endCard.centerY },
        layout: endCard.layout 
      });

      // Calculate connection points on card edges for better visual connection
      const deltaX = endCard.centerX - startCard.centerX;
      const deltaY = endCard.centerY - startCard.centerY;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      
      console.log('🎯 Distance calculation:', { deltaX, deltaY, distance });
      
      // Calculate unit vector from start to end
      const unitX = deltaX / distance;
      const unitY = deltaY / distance;
      
      // console.log('🎯 Unit vector:', { unitX, unitY });
      
      // Better rectangular edge calculation instead of circular approximation
      // Calculate which edge of the rectangle the line intersects
      const startHalfWidth = startCard.layout.width / 2;
      const startHalfHeight = startCard.layout.height / 2;
      const endHalfWidth = endCard.layout.width / 2;
      const endHalfHeight = endCard.layout.height / 2;

      // Calculate intersection with rectangle edges for start card
      let startEdgeX, startEdgeY;
      
      // For better UX, connect from the edge facing the target card
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Horizontal connection is dominant - connect from left/right edge
        if (deltaX > 0) {
          // Target is to the right - connect from right edge of start card
          startEdgeX = startCard.centerX + startHalfWidth;
          startEdgeY = startCard.centerY;
        } else {
          // Target is to the left - connect from left edge of start card
          startEdgeX = startCard.centerX - startHalfWidth;
          startEdgeY = startCard.centerY;
        }
      } else {
        // Vertical connection is dominant - connect from top/bottom edge
        if (deltaY > 0) {
          // Target is below - connect from bottom edge of start card
          startEdgeX = startCard.centerX;
          startEdgeY = startCard.centerY + startHalfHeight;
        } else {
          // Target is above - connect from top edge of start card
          startEdgeX = startCard.centerX;
          startEdgeY = startCard.centerY - startHalfHeight;
        }
      }

      // Calculate intersection with rectangle edges for end card  
      let endEdgeX, endEdgeY;
      
      // For end card, connect to the edge facing the start card
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Horizontal connection is dominant
        if (deltaX > 0) {
          // Start is to the left - connect to left edge of end card
          endEdgeX = endCard.centerX - endHalfWidth;
          endEdgeY = endCard.centerY;
        } else {
          // Start is to the right - connect to right edge of end card
          endEdgeX = endCard.centerX + endHalfWidth;
          endEdgeY = endCard.centerY;
        }
      } else {
        // Vertical connection is dominant
        if (deltaY > 0) {
          // Start is above - connect to top edge of end card
          endEdgeX = endCard.centerX;
          endEdgeY = endCard.centerY - endHalfHeight;
        } else {
          // Start is below - connect to bottom edge of end card
          endEdgeX = endCard.centerX;
          endEdgeY = endCard.centerY + endHalfHeight;
        }
      }

      const startPosition = {
        x: startEdgeX,
        y: startEdgeY,
      };
      
      const endPosition = {
        x: endEdgeX,
        y: endEdgeY,
      };

      console.log('🎯 Calculated edge positions:', { 
        startPosition, 
        endPosition,
        note: 'These should be at card edges, not centers'
      });

      console.log('🎯 Comparison - Centers vs Edges:', {
        startCenter: { x: startCard.centerX, y: startCard.centerY },
        startEdge: startPosition,
        endCenter: { x: endCard.centerX, y: endCard.centerY },
        endEdge: endPosition,
        offsetDistance: { 
          start: Math.sqrt(Math.pow(startPosition.x - startCard.centerX, 2) + Math.pow(startPosition.y - startCard.centerY, 2)),
          end: Math.sqrt(Math.pow(endPosition.x - endCard.centerX, 2) + Math.pow(endPosition.y - endCard.centerY, 2))
        }
      });

      const newConnection: Connection = {
        startCardId,
        endCardId,
        startPosition,
        endPosition,
      };

      console.log('New connection with edge points:', newConnection);

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