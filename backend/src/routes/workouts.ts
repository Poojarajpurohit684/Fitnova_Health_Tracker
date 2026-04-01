import { WorkoutService } from '../services/WorkoutService';
import { createCrudRouter } from '../utils/crudHandler';

const workoutService = new WorkoutService();

const router = createCrudRouter(
  {
    create: (userId, data) => workoutService.createWorkout({ ...data, userId }),
    getList: (userId, limit, offset) => workoutService.getWorkouts(userId, limit, offset).then(r => ({ items: r.workouts, total: r.total })),
    getById: (id, userId) => workoutService.getWorkoutById(id, userId),
    update: (id, userId, data) => workoutService.updateWorkout(id, userId, data),
    delete: (id, userId) => workoutService.deleteWorkout(id, userId),
  },
  { create: ['exerciseType', 'duration', 'intensity', 'startTime', 'endTime'] }
);

export default router;
