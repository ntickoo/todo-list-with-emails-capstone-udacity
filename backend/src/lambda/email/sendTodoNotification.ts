import { UserInfoService } from "../../helpers/service/userInfoService";
import { UserInfo } from "../../models/UserInfo";
import { createLogger } from "../../utils/logger";
import * as ejs from "ejs";
import { TodoItem } from "../../models/TodoItem";
import { TodoService } from "../../helpers/service/todos";
import { EmailService } from "../../helpers/service/EmailService";
import { EmailTemplate } from "./templates/todo-notification-template";

const logger = createLogger('sendTodoNotificationLambda')

const userInfoService = new UserInfoService()
const todoService = new TodoService()
const template = new EmailTemplate().template

exports.handler = async (event) => {
    logger.info(`sendTodoNotificationLambda ${event} `)

    const allUsers : UserInfo[] = await userInfoService.getAllUserInfo();

    logger.info(`Number of users to be notified - ${allUsers.length}`)
    for(let i=0; i < allUsers.length; i++){
      const usr: UserInfo = allUsers[i]

      logger.info(`Processing notification process for ${usr}`);
    
      const userTodos: TodoItem[] = await todoService.getAllTodos(usr.userId)
  
      logger.info(`${userTodos.length} Number of Todo Items found for ${usr.userId}`)

      if (userTodos && userTodos.length > 0) {
        const pendingTodoItems   : TodoItem[] = userTodos.filter((todo) => !todo.done);
        const completedTodoItems : TodoItem[] = userTodos.filter((todo) => todo.done);
        const hasPendingTodos    : boolean    = pendingTodoItems      && pendingTodoItems.length   > 0;
        const hasCompletedTodos  : boolean    = completedTodoItems    && completedTodoItems.length > 0;
  
        const ejsParams = {
          pendingTodos        : pendingTodoItems  ,
          completedTodos      : completedTodoItems,
          hasPendingTodos     : hasPendingTodos   ,
          hasCompletedTodos   : hasCompletedTodos ,
        };
  
        logger.info(`Preparing to send email for user ${usr}, ${JSON.stringify(ejsParams)}`)

        const output = ejs.render(template, ejsParams)

        const emailService : EmailService = new EmailService();
        const emailResp = await emailService.sendMail({
          body: output,
          to: usr.email,
          subject: "Todo List - Reminder - Udacity Capstone"
        });

        logger.info(`Email sent response - ${emailResp}`)
      }
    }

    const response = {
        statusCode: 200,
        body: JSON.stringify('All emails sent successfully.'),
    };
    return response;
};
