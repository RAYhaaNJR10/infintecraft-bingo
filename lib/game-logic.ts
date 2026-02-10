export const BINGO_CONCEPTS = [
    "Binary Search", "Recursion", "Big O Notation", "Hash Map", "Linked List",
    "Stack", "Queue", "Graph", "Tree", "Dynamic Programming",
    "Sorting Algorithm", "API", "Database", "SQL", "NoSQL",
    "Git", "Docker", "Kubernetes", "Cloud Computing", "Machine Learning",
    "Neural Network", "Blockchain", "Cybersecurity", "Encryption", "Firewall",
    "HTML", "CSS", "JavaScript", "React", "Node.js",
    "Python", "Java", "C++", "Compiler", "Interpreter",
    "Debugging", "Unit Testing", "Agile", "Scrum", "DevOps",
    "REST", "GraphQL", "WebSockets", "Microservices", "Serverless",
    "Virtual Machine", "Operating System", "Linux", "Network Protocol", "HTTP"
];

export function generateBingoCard() {
    // Shuffle the concepts
    const shuffled = [...BINGO_CONCEPTS].sort(() => 0.5 - Math.random());

    // Take first 9 for 3x3 grid
    const selected = shuffled.slice(0, 9);

    return selected.map((label, index) => ({
        id: `cell-${index}-${Date.now()}`,
        label,
        completed: false
    }));
}
