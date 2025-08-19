module.exports = function (io) {
  io.on('connection', socket => {
    console.log('⚡️  Client connected:', socket.id);

    // Tham gia phòng giải đấu
    socket.on('joinTournament', tournamentId => {
      socket.join(tournamentId);
    });

    socket.on('disconnect', () => console.log('Client disconnected:', socket.id));
  });
};
