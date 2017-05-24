/**
 * Declare the namespace for the library.
 */
jqSlidingPuzzle = new Object();
var piecesArray;
var emptyPiecePosBoard = new Array(2);
var emptyPieceId;
var numberOfPiecesCorrect;
var winCondition;
var piecesNumber;
var puzzleId;
jqSlidingPuzzle.createPuzzleFromURL = function(containerSelector, imageUrl, options) {
    // Add image to the container.
    var imgId = 'img_' + new Date().getTime();
    jQuery(containerSelector).append('<img src="'+imageUrl+'" id="'+imgId+'" alt=""/>');

    // Create puzzle from the image.
    jqSlidingPuzzle.createPuzzleFromImage("#" + imgId, options);
};

/**
 * Creates a puzzle from an image already defined in the page.
 *
 * @param {string} imageSelector The jQuery selector of the image used for the puzzle.
 * @param {object} options An associative array with the values 'piecesSize', 'borderWidth' and 'shuffle' (which is an associative arrary with the values 'rightLimit', 'leftLimit', 'topLimit' and 'bottomLimit').
 */
jqSlidingPuzzle.createPuzzleFromImage = function(imageSelector, options) {
    // Verify if the image exists.
    if(jQuery(imageSelector).size() > 0) {   
        // Verify if the image has been fully loaded.
        if(jQuery(imageSelector).width() > 0 && jQuery(imageSelector).height() > 0) {
            // Transform image to puzzle.
            jqSlidingPuzzle.imageToPuzzle(imageSelector, options);
        } else {
            // Declare variable for check if the puzzle has been created.
            var puzzleCreated = false;

            // Add event for when the puzzle is created.
            jQuery(imageSelector).load(function() {
                if(!puzzleCreated) {
                    puzzleCreated = true;
                    jqSlidingPuzzle.imageToPuzzle(imageSelector, options);
                }
            });
            
            // Check, just in case, if the image has been loaded.
            if(jQuery(imageSelector).width() > 0 && jQuery(imageSelector).height() > 0) {
                puzzleCreated = true;
                jqSlidingPuzzle.imageToPuzzle(imageSelector, options);
            }            
        }
    }
}
jqSlidingPuzzle.imageToPuzzle = function(imageSelector, options) {
    // Process parameters.
    var img = jQuery(imageSelector);
    if(img.size() > 1) img = img.find(':first');    
	var usingBackgroundImage = (options != null && !isNaN(options.is_using_background_image))? options.is_using_background_image : false;
    var borderWidth = (options != null && !isNaN(options.borderWidth))? parseInt(options.borderWidth, 10) : 5;
    puzzleId = 'puzzle_' + new Date().getTime();
	piecesNumber = (options != null && !isNaN(options.piecesNumber))? parseInt(options.piecesNumber,10) : 5;
	numberOfPiecesCorrect = piecesNumber * piecesNumber;
	winCondition = piecesNumber * piecesNumber;
    // Draw the puzzle frame over the image.
    var imgWidth = img.width();
    var imgHeight = img.height();
    var imgPosX = img.position().left;
    var imgPosY = img.position().top;
    var imgSrc = img.attr("src");
	if (usingBackgroundImage == false)
	{
		var html = '<div class="jigsaw" id="'+puzzleId+'" style="left:'+(imgPosX-borderWidth)+'px; top:'+(imgPosY-borderWidth)+'px; width:'+(imgWidth)+'px; min-height:'+(imgHeight)+'px; border-width:'+borderWidth+'px;">' +
                   '<div class="puzzle" style="width:'+imgWidth+'px; height:'+imgHeight+'px; "></div>' +
                   '<div class="menu" style="width:'+(imgWidth)+'px;">' + 
                        '<table class="menu"><tr>' +                                                         
                            '<td>Time: <span class="time_compter" id="'+puzzleId+'_time"></span></td>' + 
                        '</tr></table>' + 
                   '</div>' +
               '</div>';
		jQuery('body').append(html);
	}
	else
	{
		var html = '<div class="jigsaw" id="'+puzzleId+'" style="left:'+(imgPosX-borderWidth)+'px; top:'+(imgPosY-borderWidth)+'px; width:'+(imgWidth)+'px; min-height:'+(imgHeight)+'px; border-width:'+borderWidth+'px;">' +
                   '<div class="puzzle" style="width:'+imgWidth+'px; height:'+imgHeight+'px; background-image:url(\''+imgSrc+'\');"></div>' +
                   '<div class="menu" style="width:'+(imgWidth)+'px;">' + 
                        '<table class="menu"><tr>' +                             
                            '<td>Time: <span class="time_compter" id="'+puzzleId+'_time"></span></td>' + 
                        '</tr></table>' + 
                   '</div>' +
               '</div>';
		jQuery('body').append(html);
	}
    var piecesContainer = jQuery("#" + puzzleId);

    // Calculate the number of pieces.
    var piecesWidth = parseInt(imgWidth / piecesNumber);  
    var piecesHeight = parseInt(imgHeight / piecesNumber);    
    // Save the number of pieces and set the counter which checks how many pieces has been put in the right location.
    piecesContainer.data('pieces-number', piecesNumber*piecesNumber);
    piecesContainer.data('pieces-located', 0);

    // Bind z-index value to container and set the z-index of the menu.
    piecesContainer.data('last-z-index', piecesNumber*piecesNumber);
    piecesContainer.find('div.menu').css("z-index", piecesNumber*piecesNumber);

	piecesArray = new Array(piecesNumber);
	for (var i = 0; i < piecesNumber; i++)
	{
		piecesArray[i] = new Array(piecesNumber);
		for (var j = 0; j < piecesNumber; j++)
		{
			piecesArray[i][j] = 1;
		}
	}
	
	var randomPieceCreated = false;
    // Create pieces.
    for(var r=0; r<piecesNumber; r++) {
        for(var c=0; c<piecesNumber; c++) {						
			var posX = c*piecesWidth;
			var posY = r*piecesHeight;
			var backgroundPosX = -c*piecesWidth;
			var backgroundPosY = -r*piecesHeight;
			var id = puzzleId + '_piece_'+r+'x'+c;		
			if (randomPieceCreated == false)
			{
				var temp = Math.floor(Math.random() * (10));
			}
			if (temp == 9 || (randomPieceCreated == false && r == piecesNumber - 1 && c == piecesNumber - 1))
			{
				randomPieceCreated = true;
				temp = 0;
				html = '<div id="' + id + '" ' + 
							'class="sliding_piece" ' +
								'data-posX="' + posX + '" ' +
								'data-posY="' + posY + '" ' +
								'data-posXBoard="' + r + '" ' +
								'data-posYBoard="' + c + '" ' +
								'data-oriPosXBoard="' + r + '" ' +
								'data-oriPosYBoard="' + c + '" ' +
								'style="background-image: url(\'white.png\');' + 
									   'background-position: ' + backgroundPosX + 'px ' + backgroundPosY + 'px;' +
									   'left: ' + posX + 'px; ' +
									   'top: ' + posY + 'px; ' +
									   'width: ' + piecesWidth + 'px; ' +
									   'height: ' + piecesHeight + 'px;">' +
							'</div>';
				piecesContainer.append(html);
				emptyPiecePosBoard[0] = r;
				emptyPiecePosBoard[1] = c;
				emptyPieceId = puzzleId + '_piece_'+ r +'x'+ c;
			}
			else
			{
            // Calculate parameter.
				
				// Add html element.
				html = '<div id="' + id + '" ' + 
							'class="sliding_piece" ' +
								'data-posX="' + posX + '" ' +
								'data-posY="' + posY + '" ' +
								'data-posXBoard="' + r + '" ' +
								'data-posYBoard="' + c + '" ' +
								'data-oriPosXBoard="' + r + '" ' +
								'data-oriPosYBoard="' + c + '" ' +
								'style="background-image: url(\''+imgSrc+'\');' + 
									   'background-position: ' + backgroundPosX + 'px ' + backgroundPosY + 'px;' +
									   'left: ' + posX + 'px; ' +
									   'top: ' + posY + 'px; ' +
									   'width: ' + piecesWidth + 'px; ' +
									   'height: ' + piecesHeight + 'px;">' +
							'</div>';
				piecesContainer.append(html);    
			}
			jQuery("#" + id).css("z-index", piecesNumber*piecesNumber-1);
			
            // Add clickable behavior.
            jQuery("#" + id).click(function(){
				// Get position on board of the piece clicked
				var posXBoard = parseInt(jQuery(this).attr('data-posXBoard'), 10);
                var posYBoard = parseInt(jQuery(this).attr('data-posYBoard'), 10);
				// Calculate the distance between the piece clicked and the empty piece
				var distance = Math.abs(posXBoard - emptyPiecePosBoard[0]) + Math.abs(posYBoard - emptyPiecePosBoard[1]);
				if (distance == 1)
				{	
					// Start timer counter.
                    jqSlidingPuzzle.startTimerCounter(piecesContainer);
					//Calculate the number before the swap				
					var change = piecesArray[posXBoard][posYBoard] + piecesArray[emptyPiecePosBoard[0]][emptyPiecePosBoard[1]];				
					//Get clicked piece position					
					var posX = parseInt(jQuery(this).attr('data-posX'), 10);
                    var posY = parseInt(jQuery(this).attr('data-posY'), 10);
					//Get empty piece position
					var posXEmpty = parseInt(jQuery("#" + emptyPieceId).attr('data-posX'), 10);
                    var posYEmpty = parseInt(jQuery("#" + emptyPieceId).attr('data-posY'), 10);
					//Move clicked piece to empty piece position
                    jQuery(this).css('left', posXEmpty);
                    jQuery(this).css('top', posYEmpty);
					
					//Update data
					jQuery(this).attr('data-posX', posXEmpty);
                    jQuery(this).attr('data-posY', posYEmpty);					
					jQuery(this).attr('data-posXBoard', emptyPiecePosBoard[0]);
                    jQuery(this).attr('data-posYBoard', emptyPiecePosBoard[1]);		
					
					//Update empty piece pos var
					emptyPiecePosBoard[0] = posXBoard;
					emptyPiecePosBoard[1] = posYBoard;
				
					//Move empty piece to clicked piece position
					jQuery("#" + emptyPieceId).css('left', posX);
                    jQuery("#" + emptyPieceId).css('top', posY);
					
					//Update data
					$("#" + emptyPieceId).attr('data-posXBoard', emptyPiecePosBoard[0]);
                    $("#" + emptyPieceId).attr('data-posYBoard', emptyPiecePosBoard[1]);
					$("#" + emptyPieceId).attr('data-posX', posX);
                    $("#" + emptyPieceId).attr('data-posY', posY);
					
					//Get clicked piece current pos on board
					posXBoard = parseInt(jQuery(this).attr('data-posXBoard'), 10);
					posYBoard = parseInt(jQuery(this).attr('data-posYBoard'), 10);
					
					//Get original clicked piece pos on board
					var oriPosXBoard = parseInt(jQuery(this).attr('data-oriPosXBoard'), 10);
					var oriPosYBoard = parseInt(jQuery(this).attr('data-oriPosYBoard'), 10);
					
					//Update piece-array
					if (posXBoard == oriPosXBoard && posYBoard == oriPosYBoard)
					{
						piecesArray[posXBoard][posYBoard] = 1;
					}
					else
					{	
						piecesArray[posXBoard][posYBoard] = 0;
					}
					
					//Get original empty piece pos on board
					var oriEmptyX = parseInt(jQuery("#" + emptyPieceId).attr('data-oriPosXBoard'), 10);
					var oriEmptyY = parseInt(jQuery("#" + emptyPieceId).attr('data-oriPosYBoard'), 10);
					
					//Update piece-array
					if (emptyPiecePosBoard[0] == oriEmptyX && emptyPiecePosBoard[1] == oriEmptyY)
					{
						piecesArray[emptyPiecePosBoard[0]][emptyPiecePosBoard[1]] = 1;
					}
					else
					{	
						piecesArray[emptyPiecePosBoard[0]][emptyPiecePosBoard[1]] = 0;
					}
					
					//Change = after - before;
					change = piecesArray[posXBoard][posYBoard] + piecesArray[emptyPiecePosBoard[0]][emptyPiecePosBoard[1]] - change;
					
					//Update numberOfPiecesCorrect
					numberOfPiecesCorrect += change;
					
					//Check win condition
					if (numberOfPiecesCorrect == winCondition)
					{
						alert("CONGRATULATION!!!! YOU HAVE COMPLETED THE PUZZLE....");
						location.reload();
					}
				}				
			});
        }
    }	
    jqSlidingPuzzle.shufflePuzzle(200);
};
jqSlidingPuzzle.shufflePuzzle = function(times){
	for (var i = 0; i < times; i++)
	{
		var isPassed = false;
		while (isPassed == false)
		{
			//Get empty piece pos on board
			var xEmpty = emptyPiecePosBoard[0];
			var yEmpty = emptyPiecePosBoard[1];
			var x = xEmpty;
			var y = yEmpty;
			//Get radom adjacent piece
			var randomNum = Math.floor(Math.random()* 4);
			switch(randomNum){
				case 0:
					x = x - 1;
					break;
				case 1:
					x = x + 1;
					break;
				case 2:
					y = y - 1;
					break;
				case 3:
					y = y + 1;
					break;
			}
			if (x  < 0 || x >= piecesNumber || y < 0 || y >= piecesNumber)
			{
				isPassed = false;
			}
			else 
			{
				isPassed = true;
			}
		}
		var pieceId = puzzleId + '_piece_'+x+'x'+ y;	
		
		var posXBoard = parseInt(jQuery("#" + pieceId).attr('data-posXBoard'), 10);
        var posYBoard = parseInt(jQuery("#" + pieceId).attr('data-posYBoard'), 10);
		//Calculate the number before the swap				
		var change = piecesArray[posXBoard][posYBoard] + piecesArray[emptyPiecePosBoard[0]][emptyPiecePosBoard[1]];				
		//Get clicked piece position					
		var posX = parseInt(jQuery("#" + pieceId).attr('data-posX'), 10);
        var posY = parseInt(jQuery("#" + pieceId).attr('data-posY'), 10);
		//Get empty piece position
		var posXEmpty = parseInt(jQuery("#" + emptyPieceId).attr('data-posX'), 10);
        var posYEmpty = parseInt(jQuery("#" + emptyPieceId).attr('data-posY'), 10);
		//Move clicked piece to empty piece position
        jQuery("#" + pieceId).css('left', posXEmpty);
        jQuery("#" + pieceId).css('top', posYEmpty);
					
		//Update data
		jQuery("#" + pieceId).attr('data-posX', posXEmpty);
        jQuery("#" + pieceId).attr('data-posY', posYEmpty);					
		jQuery("#" + pieceId).attr('data-posXBoard', emptyPiecePosBoard[0]);
        jQuery("#" + pieceId).attr('data-posYBoard', emptyPiecePosBoard[1]);		
					
		//Update empty piece pos var
		emptyPiecePosBoard[0] = posXBoard;
		emptyPiecePosBoard[1] = posYBoard;
				
		//Move empty piece to clicked piece position
		jQuery("#" + emptyPieceId).css('left', posX);
        jQuery("#" + emptyPieceId).css('top', posY);
					
		//Update data
		$("#" + emptyPieceId).attr('data-posXBoard', emptyPiecePosBoard[0]);
        $("#" + emptyPieceId).attr('data-posYBoard', emptyPiecePosBoard[1]);
		$("#" + emptyPieceId).attr('data-posX', posX);
        $("#" + emptyPieceId).attr('data-posY', posY);
					
		//Get clicked piece current pos on board
		posXBoard = parseInt(jQuery("#" + pieceId).attr('data-posXBoard'), 10);
		posYBoard = parseInt(jQuery("#" + pieceId).attr('data-posYBoard'), 10);
					
		//Get original clicked piece pos on board
		var oriPosXBoard = parseInt(jQuery("#" + pieceId).attr('data-oriPosXBoard'), 10);
		var oriPosYBoard = parseInt(jQuery("#" + pieceId).attr('data-oriPosYBoard'), 10);
					
		//Update piece-array
		if (posXBoard == oriPosXBoard && posYBoard == oriPosYBoard)
		{
			piecesArray[posXBoard][posYBoard] = 1;
		}
		else
		{	
			piecesArray[posXBoard][posYBoard] = 0;
		}
					
		//Get original empty piece pos on board
		var oriEmptyX = parseInt(jQuery("#" + emptyPieceId).attr('data-oriPosXBoard'), 10);
		var oriEmptyY = parseInt(jQuery("#" + emptyPieceId).attr('data-oriPosYBoard'), 10);
					
		//Update piece-array
		if (emptyPiecePosBoard[0] == oriEmptyX && emptyPiecePosBoard[1] == oriEmptyY)
		{
			piecesArray[emptyPiecePosBoard[0]][emptyPiecePosBoard[1]] = 1;
		}
		else
		{	
			piecesArray[emptyPiecePosBoard[0]][emptyPiecePosBoard[1]] = 0;
		}
					
		//Change = after - before;
		change = piecesArray[posXBoard][posYBoard] + piecesArray[emptyPiecePosBoard[0]][emptyPiecePosBoard[1]] - change;
					
		//Update numberOfPiecesCorrect
		numberOfPiecesCorrect += change;	
			
	}

};
jqSlidingPuzzle.startTimerCounter = function(piecesContainer) {
	// Verify if the timer has not already been started.		
	if(jQuery(piecesContainer).data('timer-status') != 'running') {
    // Change status and set initial time.
    jQuery(piecesContainer).data('timer-status', 'running');
    jQuery(piecesContainer).data('timer-value', new Date().getTime());
        
    // Refresh timer each second.
    var interval = setInterval(function(){
		jqSlidingPuzzle.refreshTimerCounter(piecesContainer);
    }, 1000);
    jQuery(piecesContainer).data('timer-interval', interval);
	}
};
jqSlidingPuzzle.refreshTimerCounter = function(piecesContainer) { 
    var currentTime = new Date().getTime();
    jqSlidingPuzzle.setTimerCounter(piecesContainer, currentTime - jQuery(piecesContainer).data('timer-value'));
};

jqSlidingPuzzle.stopTimerCounter = function(piecesContainer) { 
    // Verify if the timer has not already been stoped.
    if(jQuery(piecesContainer).data('timer-status') != 'stopped') {
        jQuery(piecesContainer).data('timer-status', 'stopped');
        clearInterval(jQuery(piecesContainer).data('timer-interval'));
    }
};
jqSlidingPuzzle.setTimerCounter = function(piecesContainer, time) {    
    time = (time>0)? time/1000 : 0;
    var seconds = parseInt(time%60, 10);
    var minutes = parseInt((time/60)%60, 10);
    var hours = parseInt(time/3600, 10);
    if(seconds < 10) seconds = '0' + seconds;
    if(minutes < 10) minutes = '0' + minutes;
    if(hours < 10) hours = '0' + hours;
    jQuery(piecesContainer).find(".time_compter").html(hours + ':' + minutes + ':' + seconds);
};