import User from './User.js';
import Tournament from './Tournament.js';

class Organizer extends User {
    constructor(data) {
        super(data);
    }

    createTournament(name, format) {
        return new Tournament({
            name,
            format,
            organizerId: this._id
        });
    }
}

export default Organizer;
