'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable('Todos');

    if (!table.userId) {
      await queryInterface.addColumn('Todos', 'userId', {
        type: Sequelize.DataTypes.INTEGER,
        allowNull: false,
      });

      await queryInterface.addConstraint('Todos', {
        fields: ['userId'],
        type: 'foreign key',
        name: 'Todos_userId_fkey', // Explicitly name the constraint
        references: {
          table: 'Users',
          field: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      });
    }
  },

  async down(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable('Todos');

    if (table.userId) {
      // Remove the foreign key constraint before dropping the column
      await queryInterface.removeConstraint('Todos', 'Todos_userId_fkey');
      await queryInterface.removeColumn('Todos', 'userId');
    }
  }
};

