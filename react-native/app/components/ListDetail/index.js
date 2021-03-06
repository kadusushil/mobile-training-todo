'use strict';

import React, {Component} from 'react';
import {StyleSheet, Text, View, Image, ListView, TabBarIOS} from 'react-native';
import Couchbase from 'react-native-couchbase-lite';
import List from './List/index';
import Users from './Users/index';
import Icon from 'react-native-vector-icons/FontAwesome';
import Feed from './../../Feed';
import ScrollableTabView from 'react-native-scrollable-tab-view';

export default class ListDetail extends Component {
  constructor() {
    super();

    const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    this.state = {
      tasksDataSource: ds.cloneWithRows([]),
      tasks: [],
      usersDataSource: ds.cloneWithRows([]),
      users: [],
    };
  }

  componentWillMount() {
    this.setupQueries();
    manager.database.get_db({db: DB_NAME})
      .then(res => {
        this.feed = new Feed(res.obj.update_seq, () => {
          this.setupQueries();
        });
      });
  }

  componentWillUnmount() {
    this.feed.stop();
  }

  setupQueries() {
    manager.query.get_db_design_ddoc_view_view({
      db: DB_NAME,
      ddoc: 'main',
      view: 'tasksByCreatedAt',
      include_docs: true,
      startkey: "[\"" + this.props.list_id + "\"]",
      endkey: "[\"" + this.props.list_id + "\"]",
      prefix_match_level: 1
    })
      .then(res => {
        const rows = res.obj.rows;
        for (let i = 0; i < rows.length; i++) {
          rows[i].url = 'http://' + manager.host + '/' + DB_NAME + '/' + rows[i].id + '/image';
        }
        this.setState({
          tasks: rows,
          tasksDataSource: this.state.tasksDataSource.cloneWithRows(rows),
        });
      })
      .catch(e => console.log('ERROR', e));
    manager.query.get_db_design_ddoc_view_view({
      db: DB_NAME,
      ddoc: 'main',
      view: 'usersByUsername',
      include_docs: true,
      startkey: "[\"" + this.props.list_id + "\"]",
      endkey: "[\"" + this.props.list_id + "\"]",
      prefix_match_level: 1
    })
      .then(res => {
        const rows = res.obj.rows;
        this.setState({
          users: rows,
          usersDataSource: this.state.usersDataSource.cloneWithRows(rows)
        });
      })
      .catch(e => console.log('ERROR', e));
  }

  render() {
    return (
      <View style={styles.container}>
        <ScrollableTabView
          tabBarActiveTextColor='#D63B30'
          tabBarUnderlineStyle={{backgroundColor: '#D63B30'}}
          locked={true}>
          <List
            tabLabel="Tasks"
            id={this.props.list_id}
            owner={this.props.list_owner}
            data={this.state.tasksDataSource} />
          <Users
            tabLabel="Users"
            id={this.props.list_id}
            owner={this.props.list_owner}
            data={this.state.usersDataSource} />
        </ScrollableTabView>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 64,
  },
});
