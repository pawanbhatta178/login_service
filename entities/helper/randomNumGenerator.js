

const randomNumGenerator = ({ length }) => {
    const high = Math.pow(10, length) - 1;
    const low = Math.pow(10, length-1 );
    console.log(high);
    console.log(low);
    return {
        get: () => {
            return Math.floor(Math.random() * (high - low) + low);
        }
    }
}



module.exports = { randomNumGenerator };