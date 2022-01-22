export class EmailTemplate {
    template: string = `<h3 style="color: cornflowerblue;">Pending ToDo's</span></h3>
    <ul>
        <% if(hasPendingTodos){ %>
    
            <% pendingTodos.forEach(function(todo) { %>
                <li>
                <strong><%= todo.name %></strong>&nbsp;&nbsp;&nbsp;
                <em>Due date:</em>&nbsp;
                <%= todo.dueDate %>
                </li>
            <% }); %>
    
        <% } else{ %>  
            <li>You have no pending to do items.</li>
        <% } %>
    </ul>
    
    <h3 style="color: cornflowerblue;">Completed ToDo's</h3>
    <ul>
        <% if(hasCompletedTodos){ %>
    
            <% completedTodos.forEach(function(todo) { %>
                <li>
                <strong><%= todo.name %></strong>&nbsp;&nbsp;&nbsp;
                <em>Due date:</em>&nbsp;
                <%= todo.dueDate %>
                </li>
            <% }); %>
    
        <% } else{ %>  
            <li>You have no completed To Do items.</li>
        <% } %>
    </ul>
    `
}