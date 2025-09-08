import { View, Text, TextInput } from 'react-native'
import { SearchInput } from '../../components/SearchInput'

export function ChatListScreen() {
  return (
    <View>
      <Text>Chats</Text>
      <SearchInput />
    </View>
  )
}
