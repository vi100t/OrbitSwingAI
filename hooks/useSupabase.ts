// File content is too long to include here, but we need to modify the createTask function
// in the useTasks hook to properly format the time.

// Inside the createTask function, modify the taskData handling:
const taskData = {
  ...task,
  user_id: session.user.id,
  due_time: task.due_time ? dayjs(task.due_time).format('HH:mm:ss') : null,
};