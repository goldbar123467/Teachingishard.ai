export const FIRST_NAMES = [
  // Common American names for 5th graders
  'Emma', 'Liam', 'Olivia', 'Noah', 'Ava', 'Ethan', 'Sophia', 'Mason',
  'Isabella', 'Lucas', 'Mia', 'Oliver', 'Charlotte', 'Aiden', 'Amelia',
  'Elijah', 'Harper', 'James', 'Evelyn', 'Benjamin', 'Abigail', 'Henry',
  'Emily', 'Sebastian', 'Elizabeth', 'Jack', 'Sofia', 'Daniel', 'Avery',
  'Michael', 'Ella', 'Alexander', 'Scarlett', 'William', 'Grace', 'Owen',
  'Chloe', 'Theodore', 'Victoria', 'Jayden', 'Riley', 'Carter', 'Aria',
  'Julian', 'Lily', 'Luke', 'Aurora', 'Grayson', 'Zoey', 'Leo',
  'Penelope', 'Isaiah', 'Layla', 'Matthew', 'Nora', 'David', 'Camila',
];

export const LAST_NAMES = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller',
  'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez',
  'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin',
  'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark',
  'Ramirez', 'Lewis', 'Robinson', 'Walker', 'Young', 'Allen', 'King',
  'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores', 'Green',
  'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell',
  'Carter', 'Roberts', 'Chen', 'Kim', 'Patel', 'O\'Brien', 'Murphy',
];

export function getRandomName(usedNames: Set<string>): { firstName: string; lastName: string } {
  let attempts = 0;
  const maxAttempts = 100;

  while (attempts < maxAttempts) {
    const firstName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
    const lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
    const fullName = `${firstName} ${lastName}`;

    if (!usedNames.has(fullName)) {
      usedNames.add(fullName);
      return { firstName, lastName };
    }
    attempts++;
  }

  // Fallback with number suffix if all names are used
  const firstName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
  const lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
  return { firstName, lastName: `${lastName} Jr.` };
}
