function autoEmptyTrash() {
  var threads = GmailApp.getTrashThreads(0, 100);
  
  while (threads.length > 0) {
    for (var i = 0; i < threads.length; i++) {
      try {
        var messages = threads[i].getMessages();
        for (var j = 0; j < messages.length; j++) {
          var msgId = messages[j].getId();
          Gmail.Users.Messages.remove('me', msgId);
        }
      } catch (e) {
        Logger.log("Skipping already deleted message: " + e.message);
      }
    }
    threads = GmailApp.getTrashThreads(0, 100);
  }
}