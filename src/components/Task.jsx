import { useState, useEffect } from 'react';
import { auth, db } from '../firebase/firebase';
import { collection, addDoc, query, where, onSnapshot, updateDoc, doc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

const Task = () => {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [user, setUser] = useState(null);
  const [profilePicId, setProfilePicId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const randomId = Math.floor(Math.random() * 1000);
    setProfilePicId(randomId);
    localStorage.setItem('profilePicId', randomId.toString());
  }, []);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (!currentUser && !localStorage.getItem('userAddress')) {
        navigate('/');
      } else {
        setUser(currentUser || { uid: localStorage.getItem('userAddress') });
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (user) {
      const q = query(collection(db, 'tasks'), where('userId', '==', user.uid));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const tasksData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setTasks(tasksData);
      });
      return () => unsubscribe();
    }
  }, [user]);

  const handleAddTask = async () => {
    if (newTask.trim() === '') return;
    await addDoc(collection(db, 'tasks'), {
      userId: user.uid,
      description: newTask,
      completed: false,
      createdAt: new Date(),
    });
    setNewTask('');
    setShowModal(false);
  };

  const handleCompleteTask = async (taskId, completed) => {
    await updateDoc(doc(db, 'tasks', taskId), { completed: !completed });
  };

  const handleLogout = () => {
    auth.signOut();
    localStorage.removeItem('userAddress');
    localStorage.removeItem('profilePicId');
    navigate('/');
  };

  const activeTasks = tasks.filter(task => !task.completed);
  const completedTasks = tasks.filter(task => task.completed);

  return (
    <div className="container">
      <div className="header">
        <h1>TasksBoard</h1>
        {profilePicId !== null && (
          <img
            src={`https://picsum.photos/id/${profilePicId}/200`}
            alt="Profile"
            className="profile-pic"
          />
        )}
      </div>

      <div className="task-list">
        <h2>Active Tasks</h2>
        <button onClick={() => setShowModal(true)} className="add-task-btn">
          <span>+</span> Add a task
        </button>
        {activeTasks.length === 0 ? (
          <p style={{ color: '#6b7280', fontStyle: 'italic' }}>
            No active tasks. Add one to get started!
          </p>
        ) : (
          activeTasks.map((task) => (
            <div key={task.id} className="task-item">
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => handleCompleteTask(task.id, task.completed)}
              />
              <span className={task.completed ? 'completed' : ''}>
                {task.description}
              </span>
            </div>
          ))
        )}
      </div>

      {completedTasks.length > 0 && (
        <div className="task-list completed-tasks">
          <h2>Completed Tasks</h2>
          {completedTasks.map((task) => (
            <div key={task.id} className="task-item">
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => handleCompleteTask(task.id, task.completed)}
              />
              <span className={task.completed ? 'completed' : ''}>
                {task.description}
              </span>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>Add a New Task</h2>
            <input
              type="text"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              placeholder="Enter task description"
              style={{ color: 'black' }}
            />
            <div className="modal-buttons">
              <button onClick={handleAddTask} className="add-btn">
                Add Task
              </button>
              <button onClick={() => setShowModal(false)} className="cancel-btn">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <button onClick={handleLogout} className="logout-btn">
        Logout
      </button>
    </div>
  );
};

export default Task;