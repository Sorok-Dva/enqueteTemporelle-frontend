import React from 'react'
import { Box, Button } from '@mui/material'
import { usePermissions } from '../../hooks/usePermissions'
import { addBotToGame, startGame, setPlayerReady, transferCreatorRights } from '../../services/gameService'
import { useAuth } from '../../context/AuthContext'
import { useUser } from '../../context/UserContext'

interface Player {
  id: string
  nickname: string
  ready: boolean
}

interface GameControlsProps {
  gameId: string | undefined
  player: Player
  isCreator: boolean
  canBeReady: boolean
  fetchGameDetails: () => void
}

/**
 * Contrôles du salon
 */
const GameControls: React.FC<GameControlsProps> = ({
  isCreator,
  gameId,
  fetchGameDetails,
  canBeReady,
  player,
}) => {
  const { token } = useAuth()
  const { user } = useUser()
  const { checkPermission } = usePermissions()

  const canAddBot = checkPermission('godPowers', 'addBot')
  const canEditGame = checkPermission('game', 'edit')

  const handleAddBot = async () => {
    if (!gameId) return
    try {
      if (!canAddBot) {
        throw new Error('Vous n\'avez pas la permission d\'ajouter un bot')
      }
      await addBotToGame(gameId, token)
      fetchGameDetails()
    } catch (error) {
      console.error('Erreur lors de l\'ajout du bot:', error)
    }
  }

  const handleStartGame = async () => {
    if (!gameId) return
    try {
      await startGame(gameId)
      fetchGameDetails()
    } catch (error) {
      console.error('Erreur lors du lancement de la partie:', error)
    }
  }

  const handleBeReady = async () => {
    if (!gameId) return
    try {
      const response = await setPlayerReady(gameId, token)
      if (response.status === 200) {
        player.ready = true
      }
    } catch (error) {
      console.error('Erreur lors du set ready:', error)
    }
  }

  const handleTransferCreator = async (newCreatorId: string) => {
    if (!gameId) return
    try {
      await transferCreatorRights(gameId, newCreatorId)
      fetchGameDetails()
    } catch (error) {
      console.error('Erreur lors du transfert des droits de créateur:', error)
    }
  }

  return (
    <>
      {isCreator && (
        <Box>
          <h3>Configurer la partie</h3>

          <Button
            variant="contained"
            color="primary"
            onClick={handleStartGame}
          >
            Lancer la partie
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={() => handleTransferCreator('1')}
          >
            Léguer les droits du salon
          </Button>

          {[ 'SuperAdmin', 'Admin', 'Developers', 'Moderator', 'ModeratorTest', 'Animator' ]
            .includes(user?.role as string) && (
            <div>
              {canEditGame && (
                <>
                  <button>Modifier le salon</button>
                </>
              )}
              {canAddBot && (
                <Button
                  variant="outlined"
                  color="warning"
                  onClick={handleAddBot}
                >
                  Ajouter un bot
                </Button>
              )}
            </div>
          )}
        </Box>
      )}

      {!isCreator && (
        <Box>
          {canBeReady && !player.ready && (
            <Button
              variant="contained"
              color="success"
              className="animate__animated animate__bounce animate__infinite"
              onClick={handleBeReady}
            >
              Je suis prêt(e) !
            </Button>
          )}
        </Box>
      )}
    </>
  )
}

export default GameControls
