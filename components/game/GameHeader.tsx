import { IconSymbol } from '@/components/ui/icon-symbol';
import { Stack, useRouter } from 'expo-router';
import { TouchableOpacity } from 'react-native';

interface GameHeaderProps {
  title?: string;
}

export function GameHeader({ title = '' }: GameHeaderProps) {
  const router = useRouter();

  return (
    <Stack.Screen
      options={{
        headerShown: true,
        title,
        headerLeft: () => (
          <TouchableOpacity onPress={() => router.replace('/')} style={{ marginLeft: 10 }}>
            <IconSymbol size={35} name="house.fill" color="black" />
          </TouchableOpacity>
        ),
      }}
    />
  );
}