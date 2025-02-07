import React from 'react'
import { Button } from '@mui/material'
import { Socket } from 'socket.io-client'

interface Player {
  nickname: string
  ready: boolean
  alive: boolean
}

interface PlayersListProps {
  players: Player[]
  player: Player | null
  isCreator: boolean
  gameStarted: boolean
  gameFinished: boolean
  creatorNickname: string
  gameId: string
  socket: Socket | null
  onKick?: (nickname: string) => void
  toggleHighlightPlayer: (nickname: string) => void
  highlightedPlayers: { [nickname: string]: string }
  alienList: string[]
}

const PlayersList: React.FC<PlayersListProps> = ({
  players,
  player,
  isCreator = false,
  gameStarted,
  gameFinished,
  creatorNickname,
  gameId,
  socket,
  toggleHighlightPlayer,
  highlightedPlayers,
  alienList,
}) => {
  const handleKickPlayer = (nickname: string) => {
    if (!isCreator || !socket || gameStarted) return
    try {
      console.log('Kicking player:', nickname)
      socket.emit('kickPlayer', {
        roomId: gameId,
        nickname,
      })
    } catch (error) {
      console.error('Erreur lors du kick:', error)
    }
  }

  return (
    <div id="block_players" className="block shadow bglightblue rounded">
      <div className="block_header">
        <h3>Liste des joueurs</h3>
      </div>
      <div className="block_content block_scrollable_wrapper scrollbar-light">
        <div className="block_scrollable_content">
          <div className="list_players">
            <strong>0/{ players.length } joueurs en vie</strong>
            { players.map((_player, index) => {
              console.log('Player:', _player)
              return (
                <div
                  className={ `list_player ${ !_player.alive ? 'player_dead': '' }` }
                  key={ index }
                >
                  { !_player.alive && (
                    <>
                      <img className="suspicious_card disabled"
                        src="/assets/images/carte2.png"/>
                      <span className="votecount clickable"
                        data-tooltip="">0</span>
                    </>
                  ) }

                  <span className="player sound-tick"
                    data-profile={ _player.nickname }>{ _player.nickname }</span>
                  { !gameStarted ? (_player.ready ? 'Prêt': 'Non prêt'): null }
                  { alienList.includes(_player.nickname) && (
                    <b className="canal_3">{ ' ' }(Alien)</b>
                  ) }
                  <span className="player_highlight"
                    style={ {
                      backgroundColor: highlightedPlayers[_player.nickname] || '#ccc',
                      userSelect: 'none'
                    } }
                    onClick={ () => toggleHighlightPlayer(_player.nickname) }>✏</span>
                  { !gameStarted
                    && !gameFinished
                    && player
                    && isCreator
                    && creatorNickname !== _player.nickname && (
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={ () => handleKickPlayer(_player.nickname) }
                    >
                        Kick
                    </Button>
                  ) }
                </div>
              )
            }) }
          </div>
        </div>
      </div>
    </div>
  )
}

export default PlayersList
