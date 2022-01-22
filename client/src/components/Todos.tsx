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

import { createTodo, deleteTodo, getTodos, patchTodo } from '../api/todos-api'
import { getUserInfo, saveUserInfo } from '../api/userinfo-api'
import Auth from '../auth/Auth'
import { Todo } from '../types/Todo'
import { UserInfo } from '../types/UserInfo'

interface TodosProps {
  auth: Auth
  history: History
}

interface TodosState {
  todos: Todo[]
  newTodoName: string
  loadingTodos: boolean
  emailAddress: string
}

export class Todos extends React.PureComponent<TodosProps, TodosState> {
  state: TodosState = {
    todos: [],
    newTodoName: '',
    loadingTodos: true,
    emailAddress: ''
  }

  handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newTodoName: event.target.value })
  }

  onEmailUpdateButtonClick = async () => {
    console.log('onEmailUpdateButtonClick', this.state.emailAddress)

    try {
      const regex = /^((?!\.)[\w\-_.]*[^.])(@\w+)(\.\w+(\.\w+)?[^.\W])$/;
      
      if(this.isEmptyOrSpaces(this.state.emailAddress) || !regex.test(this.state.emailAddress))
      {
        alert(`Please enter a valid email address.`)
        return
      }

      const newTodo = await saveUserInfo(this.props.auth.getIdToken(), {
        email: this.state.emailAddress
      })
      
      this.setState({
        emailAddress: newTodo.email,
      })
      alert('User email saved successfully in the system.');

    } catch {
      alert('Saving user info failed.')
    }
  }

  handleEmailAddressInputChange = (e: any) => {
    this.setState({ emailAddress: e.target.value });
  };

  onEditButtonClick = (todoId: string) => {
    this.props.history.push(`/todos/${todoId}/edit`)
  }
  isEmptyOrSpaces(str: string) : boolean {
    return str === null || str.match(/^ *$/) !== null;
  }
  onTodoCreate = async (event: React.ChangeEvent<HTMLButtonElement>) => {
    try {
      if(this.isEmptyOrSpaces(this.state.newTodoName) || this.state.newTodoName.length < 3)
      {
        alert(`Please enter a valid todo text of more than 2 characters.`)
        return
      }

      const dueDate = this.calculateDueDate()
      const newTodo = await createTodo(this.props.auth.getIdToken(), {
        name: this.state.newTodoName,
        dueDate
      })
      this.setState({
        todos: [...this.state.todos, newTodo],
        newTodoName: ''
      })
      this.state.newTodoName = ''
    } catch {
      alert('Todo creation failed')
    }
  }

  onTodoDelete = async (todoId: string) => {
    try {
      await deleteTodo(this.props.auth.getIdToken(), todoId)
      this.setState({
        todos: this.state.todos.filter(todo => todo.todoId !== todoId)
      })
    } catch {
      alert('Todo deletion failed')
    }
  }

  onTodoCheck = async (pos: number) => {
    try {
      const todo = this.state.todos[pos]
      await patchTodo(this.props.auth.getIdToken(), todo.todoId, {
        name: todo.name,
        dueDate: todo.dueDate,
        done: !todo.done
      })
      this.setState({
        todos: update(this.state.todos, {
          [pos]: { done: { $set: !todo.done } }
        })
      })
    } catch {
      alert('Todo deletion failed')
    }
  }

  async componentDidMount() {
    try {
      const todos = await getTodos(this.props.auth.getIdToken())
      this.setState({
        todos,
        loadingTodos: false
      })
    } catch (e) {
      if(e instanceof Error) {
        alert(`Failed to fetch todos: ${e.message}`)
      } else {
        alert('Unable to  fetch todos')
      }
    }

    // Set User Info - email address.
    try {
      const userInfo : UserInfo = await getUserInfo(this.props.auth.getIdToken())
      this.setState({
        emailAddress: userInfo.email
      })
    } catch (e) {
      if(e instanceof Error) {
        alert(`Failed to fetch user info: ${e.message}`)
      } else {
        alert('Unable to  fetch user info')
      }
    }
  }

  render() {
    return (
      <div>

        <Grid columns={2} divided>
          <Grid.Row>

            <Grid.Column>
              <Header as="h1">TODOs</Header>
            </Grid.Column>
            
            <Grid.Column textAlign="right">
              <Input 
                type='text' 
                placeholder='Email Address...' 
                action           
                defaultValue={this.state.emailAddress}
                onChange={this.handleEmailAddressInputChange}>
                <input />
                <Button type='submit' onClick={() => this.onEmailUpdateButtonClick()}>
                  Update Notification Email Address
                </Button>
              </Input>
            </Grid.Column>
          </Grid.Row>
          <Grid.Row>
            
          </Grid.Row>
        </Grid>


        {this.renderCreateTodoInput()}

        {this.renderTodos()}
      </div>
    )
  }

  renderCreateTodoInput() {
    return (
      <Grid.Row>
        <Grid.Column width={16}>
          <Input
            action={{
              color: 'teal',
              labelPosition: 'left',
              icon: 'add',
              content: 'New task',
              onClick: this.onTodoCreate
            }}
            fluid
            actionPosition="left"
            placeholder="To change the world..."
            onChange={this.handleNameChange}
          />
        </Grid.Column>
        <Grid.Column width={16}>
          <Divider />
        </Grid.Column>
      </Grid.Row>
    )
  }

  renderTodos() {
    if (this.state.loadingTodos) {
      return this.renderLoading()
    }

    return this.renderTodosList()
  }

  renderLoading() {
    return (
      <Grid.Row>
        <Loader indeterminate active inline="centered">
          Loading TODOs
        </Loader>
      </Grid.Row>
    )
  }

  renderTodosList() {
    return (
      <Grid padded>
        {this.state.todos.map((todo, pos) => {
          return (
            <Grid.Row key={todo.todoId}>
              <Grid.Column width={1} verticalAlign="middle">
                <Checkbox
                  onChange={() => this.onTodoCheck(pos)}
                  checked={todo.done}
                />
              </Grid.Column>
              <Grid.Column width={10} verticalAlign="middle">
                {todo.name}
              </Grid.Column>
              <Grid.Column width={3} floated="right">
                {todo.dueDate}
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="blue"
                  onClick={() => this.onEditButtonClick(todo.todoId)}
                >
                  <Icon name="pencil" />
                </Button>
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="red"
                  onClick={() => this.onTodoDelete(todo.todoId)}
                >
                  <Icon name="delete" />
                </Button>
              </Grid.Column>
              {todo.attachmentUrl && (
                <Image src={todo.attachmentUrl} size="small" wrapped />
              )}
              <Grid.Column width={16}>
                <Divider />
              </Grid.Column>
            </Grid.Row>
          )
        })}
      </Grid>
    )
  }

  calculateDueDate(): string {
    const date = new Date()
    date.setDate(date.getDate() + 7)

    return dateFormat(date, 'yyyy-mm-dd') as string
  }
}
