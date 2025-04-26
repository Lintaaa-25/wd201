const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Todo extends Model {
    static associate(models) {}

    static async createTodo({ title, dueDate, completed }) {
      return await this.create({ title, dueDate, completed });
    }

    static async getTodos() {
      return await this.findAll({ order: [['dueDate', 'ASC']] });
    }

    static async deleteTodo(id) {
      return await this.destroy({ where: { id } });
    }
  }

  Todo.init(
    {
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      dueDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      completed: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      sequelize,
      modelName: 'Todo',
    }
  );

  return Todo;
};
