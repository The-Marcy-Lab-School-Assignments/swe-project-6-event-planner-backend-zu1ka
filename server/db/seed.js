const bcrypt = require('bcrypt');
const pool = require('./pool');

const seed = async () => {
    try {
        await pool.query('DROP TABLE IF EXISTS rsvps CASCADE;');
        await pool.query('DROP TABLE IF EXISTS events CASCADE;');
        await pool.query('DROP TABLE IF EXISTS users CASCADE;');

        await pool.query(`
      CREATE TABLE users (
        user_id SERIAL PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL
      );
    `);

        await pool.query(`
      CREATE TABLE events (
        event_id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        date TEXT NOT NULL,
        location TEXT NOT NULL,
        event_type TEXT NOT NULL,
        max_capacity INTEGER NOT NULL,
        user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE
      );
    `);

        await pool.query(`
      CREATE TABLE rsvps (
        rsvp_id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
        event_id INTEGER REFERENCES events(event_id) ON DELETE CASCADE,
        UNIQUE (user_id, event_id)
      );
    `);

        console.log('Tables created.');

        const password_hash = await bcrypt.hash('password123', 10);

        const { rows: users } = await pool.query(`
      INSERT INTO users (username, password_hash) VALUES
        ('alice', $1),
        ('bob', $1),
        ('charlie', $1)
      RETURNING user_id, username;
    `, [password_hash]);

        console.log('Users seeded.');

        const { rows: events } = await pool.query(`
      INSERT INTO events (title, description, date, location, event_type, max_capacity, user_id) VALUES
        ('React Workshop', 'A hands-on React workshop.', '2025-06-01', 'New York, NY', 'workshop', 30, $1),
        ('Networking Mixer', 'Meet engineers in NYC.', '2025-06-15', 'Brooklyn, NY', 'networking', 80, $2),
        ('Fundraiser Gala', 'Charity gala for STEM.', '2025-07-04', 'Manhattan, NY', 'fundraiser', 200, $3),
        ('Morning Yoga', 'Group yoga in the park.', '2025-07-10', 'Central Park, NY', 'social', 40, $1),
        ('AI Conference', 'Latest in AI and ML.', '2025-08-20', 'Javits Center, NY', 'conference', 500, $2),
        ('Jazz Night', 'Live jazz on the rooftop.', '2025-09-05', 'Queens, NY', 'concert', 120, $3)
      RETURNING event_id, title;
    `, [users[0].user_id, users[1].user_id, users[2].user_id]);

        console.log('Events seeded.');

        await pool.query(`
      INSERT INTO rsvps (user_id, event_id) VALUES
        ($1, $2),
        ($1, $3),
        ($4, $5),
        ($4, $6)
      ON CONFLICT DO NOTHING;
    `, [users[1].user_id, events[0].event_id, events[1].event_id, users[2].user_id, events[2].event_id, events[3].event_id]);

        console.log('RSVPs seeded.');
        console.log('Done.');
    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
};

seed();