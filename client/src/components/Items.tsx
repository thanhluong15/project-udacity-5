import dateFormat from 'dateformat'
import { History } from 'history'
import update from 'immutability-helper'
import * as React from 'react'
import {
  Button,
  Checkbox,
  Divider,
  Grid,
  Header,
  Icon,
  Input,
  Image,
  Loader
} from 'semantic-ui-react'

import { createItem, deleteItem, getItems, patchItem, searchItem } from '../api/items-api'
import Auth from '../auth/Auth'
import { Item } from '../types/Item'

interface ItemsProps {
  auth: Auth
  history: History
}

interface ItemsState {
  items: Item[]
  newItemName: string
  loadingItems: boolean
  searchText: string
  total: number
}

export class Items extends React.PureComponent<ItemsProps, ItemsState> {
  state: ItemsState = {
    items: [],
    newItemName: '',
    loadingItems: true,
    searchText: '',
    total: 0,
  }

  // Start Search 
  handleSearch = async () => {
    this.setState({ ...this.state, loadingItems: true })
    const idToken = this.props.auth.getIdToken()
    const { searchText: searchKey } = this.state
    let data: Item[] = []

    if (searchKey === '') {
      data = await getItems(idToken)
    } else {
      data = await searchItem(searchKey, idToken)
    }
    this.setState({ items: data, loadingItems: false })
  }

  handleSearchKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ ...this.state, searchText: e.target.value })
  }
  // End Search

  handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newItemName: event.target.value })
  }

  onEditButtonClick = (itemId: string) => {
    this.props.history.push(`/items/${itemId}/edit`)
  }

  onItemCreate = async (event: React.ChangeEvent<HTMLButtonElement>) => {
    try {
      const dueDate = this.calculateStartDate()
      const newItem = await createItem(this.props.auth.getIdToken(), {
        ItemName: this.state.newItemName,
        startDate: dueDate
      })
      this.setState({
        items: [...this.state.items, newItem],
        newItemName: ''
      })
    } catch {
      alert('Item creation failed')
    }
  }

  onItemDelete = async (itemId: string) => {
    try {
      await deleteItem(this.props.auth.getIdToken(), itemId)
      this.setState({
        items: this.state.items.filter(c => c.itemId !== itemId)
      })
    } catch {
      alert('Item deletion failed')
    }
  }

  onItemCheck = async (pos: number) => {
    try {
      const item = this.state.items[pos]
      await patchItem(this.props.auth.getIdToken(), item.itemId, {
        ItemName: item.ItemName,
        startDate: item.startDate,
        done: !item.done
      })
      this.setState({
        items: update(this.state.items, {
          [pos]: { done: { $set: !item.done } }
        })
      })
    } catch {
      alert('Item deletion failed')
    }
  }

  async componentDidMount() {
    try {
      const items = await getItems(this.props.auth.getIdToken())
      this.setState({
        items,
        loadingItems: false
      })
    } catch (e) {
      alert(`Failed to fetch items: ${(e as Error).message}`)
    }
  }

  render() {
    return (
      <div>
        <Grid columns={4}>
          <Grid.Row>
            <Grid.Column><Header as="h1">List Item</Header></Grid.Column>
            <Grid.Column><Header as="h1"></Header></Grid.Column>
            <Grid.Column><Header as="h1"></Header></Grid.Column>
            <Grid.Column>
              <Input
                action={{
                  icon: 'search',
                  onClick: this.handleSearch
                }}
                fluid
                placeholder='Enter item name to search...'
                onChange={this.handleSearchKeyChange}
              />
            </Grid.Column>
          </Grid.Row>
        </Grid>
        <br />
        {this.renderCreateItemInput()}
        {this.renderItems()}
      </div>
    )
  }

  renderCreateItemInput() {
    return (
      <Grid.Row>
        <Grid.Column width={16}>
          <Input
            action={{
              color: 'blue',
              labelPosition: 'left',
              icon: 'add',
              content: 'New item',
              onClick: this.onItemCreate
            }}
            fluid
            actionPosition="left"
            placeholder="Enter your item..."
            onChange={this.handleNameChange}
          />
        </Grid.Column>
        <Grid.Column width={16}>
          <Divider />
        </Grid.Column>
      </Grid.Row>
    )
  }

  renderItems() {
    if (this.state.loadingItems) {
      return this.renderLoading()
    }

    return this.renderItemsList()
  }

  renderLoading() {
    return (
      <Grid.Row>
        <Loader indeterminate active inline="centered">
          Loading Items
        </Loader>
      </Grid.Row>
    )
  }

  renderItemsList() {
    return (
      <Grid padded>
        <Grid.Row>
          {/* <Grid.Column width={3} verticalAlign="middle">Select</Grid.Column> */}
          <Grid.Column width={4} verticalAlign="middle"><b>Image</b></Grid.Column>
          <Grid.Column width={4} verticalAlign="middle"><b>Item Name</b></Grid.Column>
          <Grid.Column width={3} verticalAlign="middle"><b>Start Date</b></Grid.Column>
          <Grid.Column width={2} verticalAlign="middle"><b>Duration</b></Grid.Column>
          <Grid.Column width={3} verticalAlign="middle"><b>Action</b></Grid.Column>
          <Grid.Column width={16}><Divider /></Grid.Column>
        </Grid.Row>
        {this.state.items.map((item, pos) => {
          return (
            <Grid.Row key={item.itemId}>
              {/* <Grid.Column width={3} verticalAlign="middle">
                <Checkbox
                  onChange={() => this.onItemCheck(pos)}
                  checked={item.done}
                />
              </Grid.Column> */}
              <Grid.Column width={4} verticalAlign="middle">
                {item.attachmentUrl && (
                  <Image src={item.attachmentUrl} size="small" wrapped />
                )}
              </Grid.Column>
              <Grid.Column width={4} verticalAlign="middle">
                {item.ItemName}
              </Grid.Column>
              <Grid.Column width={3} floated="right">
                {item.startDate}
              </Grid.Column>
              <Grid.Column width={2} floated="right">
                {item.duration}
              </Grid.Column>
              <Grid.Column width={3} floated="right">
                <Button
                  icon
                  color="blue"
                  onClick={() => this.onEditButtonClick(item.itemId)}>
                  <Icon name="pencil" />
                </Button>
                <Button
                  icon
                  color="red"
                  onClick={() => this.onItemDelete(item.itemId)}>
                  <Icon name="delete" />
                </Button>
              </Grid.Column>
              <Grid.Column width={16}><Divider /></Grid.Column>
            </Grid.Row>
          )
        })}
      </Grid>
    )
  }

  calculateStartDate(): string {
    const date = new Date()
    date.setDate(date.getDate() + 7)

    return dateFormat(date, 'yyyy-mm-dd') as string
  }
}
