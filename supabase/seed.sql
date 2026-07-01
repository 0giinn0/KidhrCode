-- Seed data: Python + JavaScript starter courses

-- Get admin user (use first user in auth.users)
DO $$
DECLARE
  admin_id UUID;
  course_id UUID;
  module_id UUID;
  lesson_id UUID;
BEGIN
  SELECT id INTO admin_id FROM auth.users LIMIT 1;

  IF admin_id IS NULL THEN
    RAISE NOTICE 'No users found. Create a user first, then re-run this seed.';
    RETURN;
  END IF;

  -- ========= PYTHON 101 =========
  course_id := gen_random_uuid();
  INSERT INTO courses (id, title, description, language, difficulty, creator_id, is_published, modules_count)
  VALUES (course_id, 'Python 101', 'Learn Python from scratch - variables, loops, functions, and more.', 'python', 'beginner', admin_id, true, 3);

  -- Module 1: Variables & Types
  module_id := gen_random_uuid();
  INSERT INTO modules (id, course_id, title, description, "order")
  VALUES (module_id, course_id, 'Variables & Data Types', 'Learn about variables, numbers, strings, and booleans', 1);

  lesson_id := gen_random_uuid();
  INSERT INTO lessons (id, module_id, title, exercise_type, config, "order", difficulty)
  VALUES (lesson_id, module_id, 'What are Variables?', 'lesson',
    '{"content": "Variables are containers for storing data values. In Python, you don''t need to declare a variable type - just assign a value:\n\n```python\nname = \"Alice\"\nage = 25\nheight = 5.6\nis_student = True\n```\n\nPython has these basic types:\n- **int**: whole numbers (1, 42, -7)\n- **float**: decimal numbers (3.14, -0.5)\n- **str**: text (\"hello\", \'world\')\n- **bool**: True or False"}', 1, 'beginner');

  lesson_id := gen_random_uuid();
  INSERT INTO lessons (id, module_id, title, exercise_type, config, "order", difficulty)
  VALUES (lesson_id, module_id, 'Variable Types Quiz', 'multiple_choice',
    '{"description": "What type is the value 3.14 in Python?", "options": ["int", "float", "str", "bool"], "correct_index": 1}', 2, 'beginner');

  lesson_id := gen_random_uuid();
  INSERT INTO lessons (id, module_id, title, exercise_type, config, "order", difficulty)
  VALUES (lesson_id, module_id, 'String Concatenation', 'code_challenge',
    '{"description": "Create a variable called `greeting` that contains the string \"Hello, World!\" and print it.", "starter_code": "# Write your code below\n", "expected_output": "Hello, World!", "test_cases": [{"input": "", "expected": "Hello, World!"}]}', 3, 'beginner');

  lesson_id := gen_random_uuid();
  INSERT INTO lessons (id, module_id, title, exercise_type, config, "order", difficulty)
  VALUES (lesson_id, module_id, 'True or False?', 'true_false',
    '{"description": "In Python, the value `\"42\"` (with quotes) is a string, not an integer.", "correct": true}', 4, 'beginner');

  lesson_id := gen_random_uuid();
  INSERT INTO lessons (id, module_id, title, exercise_type, config, "order", difficulty)
  VALUES (lesson_id, module_id, 'What Does This Print?', 'output_prediction',
    '{"code_snippet": "x = 10\ny = 3\nprint(x + y)", "correct_answer": "13"}', 5, 'beginner');

  -- Module 2: Control Flow
  module_id := gen_random_uuid();
  INSERT INTO modules (id, course_id, title, description, "order")
  VALUES (module_id, course_id, 'Control Flow', 'Master if statements, loops, and conditionals', 2);

  lesson_id := gen_random_uuid();
  INSERT INTO lessons (id, module_id, title, exercise_type, config, "order", difficulty)
  VALUES (lesson_id, module_id, 'If Statements', 'lesson',
    '{"content": "Control flow lets you make decisions in your code:\n\n```python\nage = 18\nif age >= 18:\n    print(\"Adult\")\nelif age >= 13:\n    print(\"Teen\")\nelse:\n    print(\"Child\")\n```\n\nKey points:\n- Use `if`, `elif`, `else`\n- Indentation matters (4 spaces)\n- Colon `:` after each condition"}', 1, 'easy');

  lesson_id := gen_random_uuid();
  INSERT INTO lessons (id, module_id, title, exercise_type, config, "order", difficulty)
  VALUES (lesson_id, module_id, 'For Loops', 'lesson',
    '{"content": "Loops let you repeat actions:\n\n```python\n# Loop through a list\nfor fruit in [\"apple\", \"banana\", \"cherry\"]:\n    print(fruit)\n\n# Loop with range\nfor i in range(5):\n    print(i)  # 0, 1, 2, 3, 4\n```"}', 2, 'easy');

  lesson_id := gen_random_uuid();
  INSERT INTO lessons (id, module_id, title, exercise_type, config, "order", difficulty)
  VALUES (lesson_id, module_id, 'FizzBuzz Challenge', 'code_challenge',
    '{"description": "Write a program that prints numbers 1 to 15. For multiples of 3, print \"Fizz\" instead. For multiples of 5, print \"Buzz\". For multiples of both, print \"FizzBuzz\".", "starter_code": "for i in range(1, 16):\n    # Your code here\n    pass\n", "expected_output": "1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz"}', 3, 'medium');

  -- Module 3: Functions
  module_id := gen_random_uuid();
  INSERT INTO modules (id, course_id, title, description, "order")
  VALUES (module_id, course_id, 'Functions', 'Learn to write reusable code with functions', 3);

  lesson_id := gen_random_uuid();
  INSERT INTO lessons (id, module_id, title, exercise_type, config, "order", difficulty)
  VALUES (lesson_id, module_id, 'Defining Functions', 'lesson',
    '{"content": "Functions are reusable blocks of code:\n\n```python\ndef greet(name):\n    \"\"\"Return a greeting message.\"\"\"\n    return f\"Hello, {name}!\"\n\n# Call the function\nprint(greet(\"Alice\"))  # Hello, Alice!\n```\n\nParts of a function:\n- `def` keyword\n- Function name + parentheses\n- Parameters (optional)\n- `return` value (optional)"}', 1, 'easy');

  lesson_id := gen_random_uuid();
  INSERT INTO lessons (id, module_id, title, exercise_type, config, "order", difficulty)
  VALUES (lesson_id, module_id, 'Write a Function', 'code_challenge',
    '{"description": "Write a function called `is_even` that takes a number and returns True if it''s even, False otherwise.", "starter_code": "def is_even(n):\n    # Your code here\n    pass\n\nprint(is_even(4))\nprint(is_even(7))\n", "expected_output": "True\nFalse"}', 2, 'easy');

  -- ========= JAVASCRIPT BASICS =========
  course_id := gen_random_uuid();
  INSERT INTO courses (id, title, description, language, difficulty, creator_id, is_published, modules_count)
  VALUES (course_id, 'JavaScript Basics', 'Learn JavaScript fundamentals - variables, DOM, functions, and events.', 'javascript', 'beginner', admin_id, true, 2);

  -- Module 1: JS Fundamentals
  module_id := gen_random_uuid();
  INSERT INTO modules (id, course_id, title, description, "order")
  VALUES (module_id, course_id, 'JavaScript Fundamentals', 'Variables, data types, and basic operations', 1);

  lesson_id := gen_random_uuid();
  INSERT INTO lessons (id, module_id, title, exercise_type, config, "order", difficulty)
  VALUES (lesson_id, module_id, 'Variables in JS', 'lesson',
    '{"content": "JavaScript has three ways to declare variables:\n\n```javascript\n// let - can be reassigned\nlet name = \"Alice\";\nname = \"Bob\"; // OK\n\n// const - cannot be reassigned\nconst age = 25;\n// age = 26; // Error!\n\n// var - old way, avoid using\nvar oldWay = \"deprecated\";\n```\n\nData types: number, string, boolean, null, undefined, object, array"}', 1, 'beginner');

  lesson_id := gen_random_uuid();
  INSERT INTO lessons (id, module_id, title, exercise_type, config, "order", difficulty)
  VALUES (lesson_id, module_id, 'Type Check Quiz', 'multiple_choice',
    '{"description": "What is the type of `typeof \"Hello\"` in JavaScript?", "options": ["string", "typeof", "\"string\"", "String"], "correct_index": 2}', 2, 'beginner');

  -- Module 2: Functions & Arrays
  module_id := gen_random_uuid();
  INSERT INTO modules (id, course_id, title, description, "order")
  VALUES (module_id, course_id, 'Functions & Arrays', 'Working with functions and array methods', 2);

  lesson_id := gen_random_uuid();
  INSERT INTO lessons (id, module_id, title, exercise_type, config, "order", difficulty)
  VALUES (lesson_id, module_id, 'Arrow Functions', 'lesson',
    '{"content": "Modern JavaScript uses arrow functions:\n\n```javascript\n// Traditional\nfunction add(a, b) {\n    return a + b;\n}\n\n// Arrow function\nconst add = (a, b) => a + b;\n\n// With one parameter, parentheses optional\nconst double = n => n * 2;\n\n// With no parameters\nconst hello = () => \"Hello!\";\n```"}', 1, 'easy');

  lesson_id := gen_random_uuid();
  INSERT INTO lessons (id, module_id, title, exercise_type, config, "order", difficulty)
  VALUES (lesson_id, module_id, 'Array Map', 'code_challenge',
    '{"description": "Use the `.map()` method to double each number in the array `[1, 2, 3, 4, 5]` and print the result.", "starter_code": "const numbers = [1, 2, 3, 4, 5];\n// Your code here\n", "expected_output": "[2, 4, 6, 8, 10]"}', 2, 'easy');

  RAISE NOTICE 'Seed data inserted successfully!';
END $$;
