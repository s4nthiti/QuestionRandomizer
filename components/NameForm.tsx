import React, { useState } from 'react';
import { TextInput, View, Button } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface NameFormComponents {
  onNameSet?: (text: string) => void;
}

const NameForm: React.FC<NameFormComponents> = ({ onNameSet }) => {

  const [userInput, setUserInput] = useState<string>('');

  const handleInputChange = (text: string) => {
    setUserInput(text);
  };

  const setName = () => {
    if(onNameSet) {
      onNameSet(userInput);
    }
  }

  return (
    <View style={{ width: 200 }}>
      <TextInput
        placeholder="Enter your name..."
        value={userInput}
        onChangeText={handleInputChange}
        style={styles.textInput}
      />
      <Button title="Enter" onPress={setName}/>
    </View>
  );
};

const styles = {
  textInput: {
    height: 50,
    fontSize: 18,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 30,
  },
};

export default NameForm;