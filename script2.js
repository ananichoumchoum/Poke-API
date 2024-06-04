async function trivia() {
    const response = await axios.get('https://opentdb.com/api.php?amount=10&category=18&difficulty=easy&type=multiple');
    console.log(response.data);
}
trivia();