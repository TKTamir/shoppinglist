import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, Text, View, FlatList, Button } from 'react-native';
import { Component } from 'react';

const firebase = require('firebase');
require('firebase/firestore');

export default class ShoppingLists extends Component {
  constructor(props) {
    super(props);
    this.state = {
      lists: [],
      uid: 0,
      loggedInText: 'Please wait. You’re being authenticated',
    };

    const firebaseConfig = {
      apiKey: 'AIzaSyBF7Rt7YJY9IHWY5uanaYUti9LypNJiDmw',
      authDomain: 'chatup-83ba6.firebaseapp.com',
      projectId: 'chatup-83ba6',
      storageBucket: 'chatup-83ba6.appspot.com',
      messagingSenderId: '95269935264',
    };

    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }
    this.referenceShoppingListsUser = null;
  }
  componentDidMount() {
    // Creating references to shoppinglists collection
    this.referenceShoppingLists = firebase.firestore().collection('shoppinglists');

    this.authUnsubscribe = firebase.auth().onAuthStateChanged(async (user) => {
      if (!user) {
        await firebase.auth().signInAnonymously();
      }

      // Update user state with currently active user data
      this.setState({
        uid: user.uid,
        loggedInText: 'Hello there',
      });
      //Create a refrence to the active user's document(shopping lists)
      this.referenceShoppinglistUser = firebase
        .firestore()
        .collection('shoppinglists')
        .where('uid', '==', this.state.uid);
      // Listen for collection changes for current user
      this.unsubscribeListUser = this.referenceShoppinglistUser.onSnapshot(this.onCollectionUpdate);
    });
  }

  componentWillUnmount() {
    this.authUnsubscribe();
    this.unsubscribeListUser();
  }

  onCollectionUpdate = (querySnapshot) => {
    const lists = [];
    // go through each document
    querySnapshot.forEach((doc) => {
      // get the QueryDocumentSnapshot's data
      var data = doc.data();
      lists.push({
        name: data.name,
        items: data.items.toString(),
      });
    });
    this.setState({
      lists,
    });
  };

  addList() {
    this.referenceShoppingLists.add({
      name: 'TestList',
      items: ['eggs', 'pasta', 'veggies'],
      uid: this.state.uid,
    });
  }
  render() {
    return (
      <View style={styles.container}>
        <Text>{this.state.loggedInText}</Text>
        <Text style={styles.text}>All Shopping Lists</Text>
        <FlatList
          data={this.state.lists}
          renderItem={({ item }) => (
            <Text style={styles.item}>
              {item.name}: {item.items}
            </Text>
          )}
        />
        <Button
          title="Add List"
          onPress={() => {
            this.addList();
          }}
        ></Button>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingTop: 40,
  },
  item: {
    fontSize: 20,
    color: 'blue',
  },
  text: {
    fontSize: 30,
  },
});
