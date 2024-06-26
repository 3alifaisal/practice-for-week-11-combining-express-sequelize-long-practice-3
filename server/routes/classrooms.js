// Instantiate router - DO NOT MODIFY
const express = require("express");
const router = express.Router();

// Import model(s)
const {
  Student,
  StudentClassroom,
  Classroom,
  sequelize,
  Supply,
} = require("../db/models");
const { Op } = require("sequelize");

// List of classrooms
router.get("/", async (req, res, next) => {
  //   let errorResult = { errors: [], count: 0, pageCount: 0 };
  const where = req.where;
  // Phase 6B: Classroom Search Filters
  /*
        name filter:
            If the name query parameter exists, set the name query
                filter to find a similar match to the name query parameter.
            For example, if name query parameter is 'Ms.', then the
                query should match with classrooms whose name includes 'Ms.'

        studentLimit filter:
            If the studentLimit query parameter includes a comma
                And if the studentLimit query parameter is two numbers separated
                    by a comma, set the studentLimit query filter to be between
                    the first number (min) and the second number (max)
                But if the studentLimit query parameter is NOT two integers
                    separated by a comma, or if min is greater than max, add an
                    error message of 'Student Limit should be two integers:
                    min,max' to errorResult.errors
            If the studentLimit query parameter has no commas
                And if the studentLimit query parameter is a single integer, set
                    the studentLimit query parameter to equal the number
                But if the studentLimit query parameter is NOT an integer, add
                    an error message of 'Student Limit should be a integer' to
                    errorResult.errors 
    */

  // Your code here

  const classrooms = await Classroom.findAll({
    attributes: ["id", "name", "studentLimit"],
    where,
    order: [["name"]],
    include: [
      {
        model: StudentClassroom,
        attributes: [
          [sequelize.fn("AVG", sequelize.col("grade")), "avgGrade"],
          [sequelize.fn("COUNT", sequelize.col("studentId")), "numStudents"],
        ],
      },
    ],
    group: ["Classroom.id"],
  });

  res.json(classrooms);
});

// Single classroom
router.get("/:id", async (req, res, next) => {
  let classroom = await Classroom.findByPk(req.params.id, {
    attributes: ["id", "name", "studentLimit"],

    // Phase 7:
    // Include classroom supplies and order supplies by category then
    include: [
      {
        model: Supply,
        attributes: ["id", "name", "category", "handed"],
      },
      {
        model: Student,
        attributes: ["id", "firstName", "lastName", "leftHanded"],
        through: {
          model: StudentClassroom,
          attributes: [],
        },
      },
    ],
    order: [
      [{ model: Supply }, "category"],
      [{ model: Supply }, "name"],
      [{ model: Student }, "lastName"],
      [{ model: Student }, "firstName"],
    ],
    // name (both in ascending order)
    // Include students of the classroom and order students by lastName
    // then firstName (both in ascending order)
    // (Optional): No need to include the StudentClassrooms
    // Your code here
  });

  if (!classroom) {
    res.status(404);
    res.send({ message: "Classroom Not Found" });
  }

  // Phase 5: Supply and Student counts, Overloaded classroom

  // Phase 5A: Find the number of supplies the classroom has and set it as
  // a property of supplyCount on the response
  const supplyCount = await classroom.countSupplies();
  console.log(supplyCount);
  // Phase 5B: Find the number of students in the classroom and set it as
  // a property of studentCount on the response
  const studentCount = await classroom.countStudents();
  // Phase 5C: Calculate if the classroom is overloaded by comparing the
  // studentLimit of the classroom to the number of students in the
  // classroom
  const overloaded = studentCount > classroom.studentLimit ? true : false;
  // Optional Phase 5D: Calculate the average grade of the classroom
  // Your code here
  const studentClassroom = await StudentClassroom.findAll({
    attributes: [[sequelize.fn("AVG", sequelize.col("grade")), "avgGrade"]],
    where: {
      classroomId: req.params.id,
    },
  });
  let avgGrade = studentClassroom.avgGrade;
  res.json({
    classroom,
    supplyCount,
    studentCount,
    overloaded,
    avgGrade,
  });
});

// Export class - DO NOT MODIFY
module.exports = router;
