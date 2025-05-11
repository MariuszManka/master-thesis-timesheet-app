import React, { useEffect, useState } from 'react';
import { Avatar, Breadcrumbs, Button, Card, CardContent, CardHeader, Divider, IconButton, Link, List, ListItem, ListItemAvatar, ListItemText, TextareaAutosize, TextField, Typography } from '@mui/material'
import { useDispatch, useSelector } from 'react-redux'
import { AppState } from 'store'


import './SingleTaskViewStyles.scss'
import { ISingleTaskCommentsProps, ISingleTaskViewDescriptionProps, ISingleTaskViewTaskInfoProps, ISingleTaskViewTaskStatsProps } from './SingleTaskViewProps'
import { useNavigate, useParams } from 'react-router-dom'
import { AppLinks } from 'common/AppLinks'
import tasksService, { ITaskCommentModel, ITaskResponseModel } from 'services/TasksService/TasksService'
import { DateTime } from 'luxon'
import { Environment } from 'environment/AppSettings'
import { ScrollPanel } from 'primereact/scrollpanel'
import { Fieldset } from 'primereact/fieldset'
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { setCurrentSelectedTaskForPreview } from 'store/TasksSlice/TasksSlice'
import { Dialog } from 'primereact/dialog'
import { useSnackbar } from 'notistack'
import SaveIcon from '@mui/icons-material/Save'
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import TaskTimesheetTable from 'components/Tables/TimesheetTable/TaskTimesheetTable/TaskTimesheetTable'




const SingleTaskViewTaskStats = (props: ISingleTaskViewTaskStatsProps) => {
   const cardsContent = [
      {header: 'Data rozpoczęcia ', content: DateTime.fromFormat(props.startingDate, props.appDatabaseDateFormatForFront).toFormat(Environment.dateFormatToDisplay)},
      {header: 'Szacowany czas', content: props.estimatedHours},
      {header: 'Ważne ', content: 'Priorytet'},
      {header: 'Data zakończenia', content: props.dueDate ? DateTime.fromFormat(props.dueDate as string, props.appDatabaseDateFormatForFront).toFormat(Environment.dateFormatToDisplay) : null},
   ]

   return (
      <div style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
         <div className='single-task-view-task-stats-wrapper'>
            {
               cardsContent.map((singleCard, singleCardId) => (
                  <Card sx={{ borderRadius: 5, boxShadow: 'none' }} classes={{ root: 'single-task-view-single-task-outer-card-wrapper' }} key={singleCardId}>
                     <CardContent classes={{ root: 'single-task-view-single-task-inner-wrapper' }}>
                        <h5 className='single-task-view-task-heading'>{singleCard.header}</h5>
                        {
                           singleCard.content !== null ? 
                           <p className='single-task-view-task-content'>{singleCard.content}</p> : 
                           <p className='single-task-view-task-content' style={{ textDecoration: 'line-through', textDecorationThickness: 2 }} >&emsp;&emsp;</p>
                        }
                     </CardContent>
                  </Card>
               ))
            }
         </div>
      </div>
   )
}

const SingleTaskViewTaskInfo = (props: ISingleTaskViewTaskInfoProps) => {
   const { currentSelectedTask, appDatabaseDateFormatForFront } = props 

      // id: number;
      // subject: string;
      // description: string;
      // descriptionInHTMLFormat: string;
      // taskType?: string;
      // taskStatus?: string;
      // priority?: string;
      // startingDate: string;
      // dueDate?: string;
      // estimatedHours?: number;
      // parentTaskId?: number;
      // timesheets?: ITimesheetResponseModel[];
      // assignedUsers: IAllUsersNamesResponse[];



      // TODO IMPORTANT - DODAĆ W NAGŁÓKU
      // Zadanie #${currentSelectedTask.id}: ${currentSelectedTask.subject}`


   return (
      <Fieldset legend={"Informacje"} toggleable className='single-task-view-task-info-wrapper-inner-wrapper' style={{ borderRadius: 10 }}>
         <div className='single-task-view-task-info-grid-inner-wrapper'>
            <div className='single-task-view-task-info-grid-item'>
               <h6>Typ zagadnienia:</h6>
               <p>{currentSelectedTask.taskType}</p>
            </div>
            <div className='single-task-view-task-info-grid-item'>
               <h6>Status:</h6>
               <p>{currentSelectedTask.taskStatus}</p>
            </div>
            <div className='single-task-view-task-info-grid-item'>
               <h6>Priorytet:</h6>
               <p>{currentSelectedTask.priority}</p>
            </div>
            <div className='single-task-view-task-info-grid-item'>
               <h6>Szacowany czas:</h6>
               <p>{currentSelectedTask.estimatedHours !== null? `${currentSelectedTask.estimatedHours} h` : '---'}</p>
            </div>
            <div className='single-task-view-task-info-grid-item'>
               <h6>Data rozpoczęcia:</h6>
               <p>{DateTime.fromFormat(currentSelectedTask.startingDate, appDatabaseDateFormatForFront).toFormat(Environment.dateFormatToDisplay)}</p>
            </div>
            <div className='single-task-view-task-info-grid-item'>
               <h6>Data zakończenia:</h6>
               <p>
                  {currentSelectedTask.dueDate ? DateTime.fromFormat(currentSelectedTask.dueDate as string, props.appDatabaseDateFormatForFront).toFormat(Environment.dateFormatToDisplay) : 'Brak'}
               </p>
            </div>
         </div>
      </Fieldset>
      // <div className='single-task-view-task-info-wrapper'>
      //    <Card sx={{ borderRadius: 5 }}>
      //       <CardContent classes={{ root: 'single-task-view-task-info-wrapper-inner-wrapper' }}>
      //          <h5 id="single-task-view-task-info-subject">{`Zadanie #${currentSelectedTask.id}: ${currentSelectedTask.subject}`}</h5>
      //          <div className='single-task-view-task-info-grid-inner-wrapper'>
      //             <div className='single-task-view-task-info-grid-item'>
      //                <h6>Typ zagadnienia:</h6>
      //                <p>{currentSelectedTask.taskType}</p>
      //             </div>
      //             <div className='single-task-view-task-info-grid-item'>
      //                <h6>Status:</h6>
      //                <p>{currentSelectedTask.taskStatus}</p>
      //             </div>
      //             <div className='single-task-view-task-info-grid-item'>
      //                <h6>Priorytet:</h6>
      //                <p>{currentSelectedTask.priority}</p>
      //             </div>
      //             <div className='single-task-view-task-info-grid-item'>
      //                <h6>Szacowany czas:</h6>
      //                <p>{currentSelectedTask.estimatedHours}</p>
      //             </div>
      //             <div className='single-task-view-task-info-grid-item'>
      //                <h6>Data rozpoczęcia:</h6>
      //                <p>{DateTime.fromFormat(currentSelectedTask.startingDate, appDatabaseDateFormatForFront).toFormat(Environment.dateFormatToDisplay)}</p>
      //             </div>
      //             <div className='single-task-view-task-info-grid-item'>
      //                <h6>Data zakończenia:</h6>
      //                <p>
      //                   {currentSelectedTask.dueDate ? DateTime.fromFormat(currentSelectedTask.dueDate as string, props.appDatabaseDateFormatForFront).toFormat(Environment.dateFormatToDisplay) : 'Brak'}
      //                </p>
      //             </div>
      //          </div>
      //       </CardContent>
      //    </Card>
      // </div>
   )
}


const SingleTaskViewDescription = (props: ISingleTaskViewDescriptionProps) => {
   return (
      <Fieldset legend={"Opis zadania"} toggleable className='single-task-view-task-description' style={{ borderRadius: 10 }} >
         <ScrollPanel style={{ maxHeight: 400 }} className='single-task-view-task-description-inner-scroll-wrapper'>
            <div dangerouslySetInnerHTML={{ __html: props.descriptionInHTMLFormat }}/>
         </ScrollPanel>
      </Fieldset>
      // <div className='single-task-view-task-description'>
      //    <Card sx={{ borderRadius: 5 }}>
      //      <h5 id="single-task-view-task-description-heading">Opis zadania:</h5>

      //    </Card>
      // </div>
   )
}


const SingleTaskViewTimesheetTable = (props: { currentSelectedTaskId: number }) => {
   return (
      <Fieldset legend={"Timesheet"} toggleable className='single-task-view-timesheet-table'>
         <TaskTimesheetTable currentSelectedTaskId={props.currentSelectedTaskId} />
      </Fieldset>
   )
}


const SingleTaskViewComments = ({ currentTaskId, currentUserId }: ISingleTaskCommentsProps) => {
   const dispatch = useDispatch()
   const { enqueueSnackbar } = useSnackbar()

   const currentTaskComments = useSelector( (state: AppState) => state.tasksState.currentSelectedTaskForPreview?.comments)

   const [commentToDelete, setCommentToDelete] = React.useState<ITaskCommentModel | null>(null)
   const [editingCommentId, setEditingCommentId] = React.useState<number | null>(null)
   const [editedContent, setEditedContent] = React.useState<string>("")
   const [newCommentContent, setNewCommentContent] = React.useState<string>("")

   useEffect(() => {
      const fetchTask = async () => {
         try {
            const updatedTask = await tasksService.fetchSingleTaskById(currentTaskId)
            dispatch(setCurrentSelectedTaskForPreview(updatedTask))
         } 
         catch (e) {
            enqueueSnackbar("Nie udało się odświeżyć zadania.", { variant: "error", autoHideDuration: 5000, preventDuplicate: true })
         }
      }

      if (currentTaskId) {
         fetchTask()
      }
   }, [currentTaskId])

   const deleteSingleComment = async () => {
      if (!commentToDelete) {
         enqueueSnackbar("Nie udało się usunąć komentarza, spróbuj ponownie później", { variant: "error", autoHideDuration: 5000 })
         return
      }

      try {
         await tasksService.deleteSingleTaskComment(commentToDelete.id)
         setCommentToDelete(null)
         enqueueSnackbar("Komentarz został poprawnie usunięty", { variant: "success", autoHideDuration: 5000 })
      } 
      catch {
         enqueueSnackbar("Błąd podczas usuwania komentarza", { variant: "error", autoHideDuration: 5000 })
      }
   }

   const saveEditedComment = async (comment: ITaskCommentModel) => {
      if (!editedContent.trim()) {
         enqueueSnackbar("Komentarz nie może być pusty", { variant: "error", autoHideDuration: 5000 })
         return
      }

      try {
         await tasksService.updateSingleTaskComment({ new_comment_content: editedContent, comment_to_update_id: comment.id })
         setEditingCommentId(null)
         setEditedContent("")
      } 
      catch {
         enqueueSnackbar("Nie udało się zaktualizować komentarza", { variant: "error", autoHideDuration: 5000 })
      }
   };

   const handleAddNewComment = async () => {
      if (!newCommentContent.trim()) {
         return
      }

      try {
         await tasksService.addNewTaskComment({ task_id: currentTaskId, commentContent: newCommentContent })

         setNewCommentContent("")
         enqueueSnackbar("Komentarz został poprawnie dodany", { variant: "success", autoHideDuration: 5000 })
      } 
      catch {
         enqueueSnackbar("Błąd podczas dodawania komentarza", { variant: "error", autoHideDuration: 5000 })
      }
   };

   const deleteCommentDialogFooter = (
      <div style={{ display: "flex", justifyContent: "flex-end", columnGap: 15 }}>
         <Button onClick={deleteSingleComment} variant="outlined" style={{ borderColor: "#010440", color: "#010440" }}>
            Tak
         </Button>
         <Button onClick={() => setCommentToDelete(null)} variant="contained" style={{ background: "#010440" }}>
            Nie
         </Button>
      </div>
   )



   if (!currentTaskComments){ 
      return null
   } 


   return (
      <Fieldset legend="Komentarze" toggleable className="single-task-view-comments-outer-wrapper" style={{ borderRadius: 10 }}>
         <div className="single-task-view-all-comments-wrapper">
            <div className="single-task-view-add-comment-wrapper">
               <textarea
                  placeholder="Dodaj komentarz"
                  className="single-task-view-add-comment-input"
                  value={newCommentContent}
                  onChange={(e) => setNewCommentContent(e.target.value)}
               />
               <Button variant="outlined" className="single-task-view-add-comment-button" onClick={handleAddNewComment}>
                  Dodaj
               </Button>
               <Divider />
            </div>

            {currentTaskComments.map((comment) => {
               const isEditing = editingCommentId === comment.id;
               const avatarUrl =
                  comment.creator_avatar !== undefined
                     ? `https://avatar.iran.liara.run/username?username=${comment.creator_full_name.trim().split(" ").join("+")}`
                     : `data:image/jpeg;base64, ${comment.creator_avatar}`;

               return (
                  <div className="single-task-view-task-comment-wrapper" key={comment.id}>
                     <div className="single-task-view-task-comment-header">
                        <div style={{ display: "flex", alignItems: "center", columnGap: 10 }}>
                           <img src={avatarUrl} alt="Avatar" />
                           <h5>{comment.creator_full_name}</h5>
                        </div>
                        <span>
                           Ostatnia aktualizacja:{" "}
                           {DateTime.fromISO(comment.lastUpdateDateTime).toFormat(`${Environment.dateFormatToDisplay} HH:mm`)}
                        </span>
                     </div>

                     {isEditing ? (
                        <TextField
                           fullWidth
                           multiline
                           minRows={2}
                           value={editedContent}
                           onChange={(e) => setEditedContent(e.target.value)}
                           className="single-task-view-task-comment-content"
                        />
                     ) : (
                        <p className="single-task-view-task-comment-content">{comment.commentContent}</p>
                     )}

                     <div className="single-task-view-task-comment-footer">
                        {comment.creator_id === currentUserId && (
                           <>
                              {isEditing ? (
                                 <Button
                                    variant="outlined"
                                    endIcon={<SaveIcon />}
                                    className="single-task-view-task-comment-edit-button"
                                    onClick={() => saveEditedComment(comment)}
                                 >
                                    Zapisz
                                 </Button>
                              ) : (
                                 <Button
                                    variant="outlined"
                                    endIcon={<EditIcon />}
                                    className="single-task-view-task-comment-edit-button"
                                    onClick={() => {
                                       setEditingCommentId(comment.id);
                                       setEditedContent(comment.commentContent);
                                    }}
                                 >
                                    Edytuj
                                 </Button>
                              )}
                              <Button
                                 onClick={() => setCommentToDelete(comment)}
                                 variant="outlined"
                                 endIcon={<DeleteIcon />}
                                 className="single-task-view-task-comment-delete-button"
                              >
                                 Usuń
                              </Button>
                           </>
                        )}
                     </div>
                     <Divider component="li" />
                  </div>
               )
            })}

            <Dialog draggable={false} resizable={false} header="Potwierdź akcję"
               visible={commentToDelete !== null} style={{ width: "35vw" }}
               onHide={() => setCommentToDelete(null)} footer={deleteCommentDialogFooter}
            >
               Czy na pewno chcesz usunąć komentarz?
            </Dialog>
         </div>
      </Fieldset>
   )
}


const SingleTaskView = () => {
   const navigate = useNavigate()
   const { id } = useParams()

   const currentSelectedTask = useSelector((state: AppState) => state.tasksState.currentSelectedTaskForPreview)
   const { appDatabaseDateFormatForFront } = useSelector((state: AppState) => state.applicationState)
   const currentUserId = useSelector((state: AppState) => state.currentUserState.id)
   const { startingDate, dueDate, estimatedHours, descriptionInHTMLFormat } = currentSelectedTask as ITaskResponseModel
   
   if(currentSelectedTask === undefined){
      navigate(AppLinks.tasks)
      return null
   }

   
   return (
      <div className='single-task-view-outer-wrapper'>
         <header className='tasks-page-header-wrapper'>
            <TaskAltIcon />
            <h1>Zadania</h1>
         </header> 
         <section className='tasks-page-content-section-outer-wrapper'>
            <Breadcrumbs aria-label="breadcrumb" style={{ marginLeft: 5, cursor: 'pointer' }}>
               <Link href={AppLinks.tasks} underline="hover" color='inherit'>Zadania</Link>
               <Link href={`${AppLinks.tasksViewSingleTask}/${id}`} underline="hover" color='inherit'>Zadanie #{id}</Link>
            </Breadcrumbs>
            {/* <SingleTaskViewTaskStats startingDate={startingDate} dueDate={dueDate} estimatedHours={estimatedHours} appDatabaseDateFormatForFront={appDatabaseDateFormatForFront} /> */}
            <SingleTaskViewTaskInfo currentSelectedTask={currentSelectedTask as ITaskResponseModel} appDatabaseDateFormatForFront={appDatabaseDateFormatForFront} />
            <SingleTaskViewDescription descriptionInHTMLFormat={descriptionInHTMLFormat} />
            <SingleTaskViewComments currentUserId={currentUserId} currentTaskId={currentSelectedTask.id as number} />
            <SingleTaskViewTimesheetTable currentSelectedTaskId={currentSelectedTask.id as number} />
         </section>
      </div>
   )
}

export default SingleTaskView















// ======================================================================== WERSJA 2 =====================================================================================
// import React from 'react';
// import { Card, CardContent, CardHeader, Typography } from '@mui/material'
// import { useSelector } from 'react-redux'
// import { AppState } from 'store'


// import './SingleTaskViewStyles.scss'
// import { ISingleTaskViewDescriptionProps, ISingleTaskViewTaskInfoProps, ISingleTaskViewTaskStatsProps } from './SingleTaskViewProps'
// import { useNavigate } from 'react-router-dom'
// import { AppLinks } from 'common/AppLinks'
// import { ITaskResponseModel } from 'services/TasksService/TasksService'
// import { DateTime } from 'luxon'
// import { Environment } from 'environment/AppSettings'
// import { ScrollPanel } from 'primereact/scrollpanel'


// const SingleTaskViewTaskStats = (props: ISingleTaskViewTaskInfoProps) => {

//    const { currentSelectedTask, appDatabaseDateFormatForFront } = props

//    const cardsContent = [
//       {content: 'Data rozpoczęcia', header: DateTime.fromFormat(currentSelectedTask.startingDate, appDatabaseDateFormatForFront).toFormat(Environment.dateFormatToDisplay)},
//       {content: 'Data zakończenia', header: DateTime.fromFormat(currentSelectedTask.dueDate as string, appDatabaseDateFormatForFront).toFormat(Environment.dateFormatToDisplay)},
//       {content: 'Szacowany czas', header: currentSelectedTask.estimatedHours},
//       {content: 'Typ zagadnienia', header: currentSelectedTask.taskType},
//       {content: 'Status', header: currentSelectedTask.taskStatus},
//       {content: 'Priorytet', header: currentSelectedTask.priority},
//    ]

//    return (
//       <div style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
//          <div className='single-task-view-task-stats-wrapper'>
//             {
//                cardsContent.map(singleCard => (
//                   <Card sx={{ borderRadius: 5 }}>
//                      <CardContent classes={{ root: 'single-task-view-single-task-inner-wrapper' }}>
//                         <h5 className='single-task-view-task-heading'>{singleCard.header}</h5>
//                         <p className='single-task-view-task-content'>{singleCard.content}</p>
//                      </CardContent>
//                   </Card>
//                ))
//             }
//          </div>
//       </div>
//    )
// }

// const SingleTaskViewTaskInfo = (props: ISingleTaskViewTaskInfoProps) => {
//    const { currentSelectedTask, appDatabaseDateFormatForFront } = props 

//       // id: number;
//       // subject: string;
//       // description: string;
//       // descriptionInHTMLFormat: string;
//       // taskType?: string;
//       // taskStatus?: string;
//       // priority?: string;
//       // startingDate: string;
//       // dueDate?: string;
//       // estimatedHours?: number;
//       // parentTaskId?: number;
//       // timesheets?: ITimesheetResponseModel[];
//       // assignedUsers: IAllUsersNamesResponse[];


      
//    return (
//       <div className='single-task-view-task-info-wrapper'>
//                         <h5 id="single-task-view-task-info-subject">{`Zadanie #${currentSelectedTask.id}: ${currentSelectedTask.subject}`}</h5>

//          {/* <Card sx={{ borderRadius: 5 }}>
//             <CardContent classes={{ root: 'single-task-view-task-info-wrapper-inner-wrapper' }}>
//                <div className='single-task-view-task-info-grid-inner-wrapper'>
//                   <div className='single-task-view-task-info-grid-item'>
//                      <h6>Typ zagadnienia:</h6>
//                      <p>{currentSelectedTask.taskType}</p>
//                   </div>
//                   <div className='single-task-view-task-info-grid-item'>
//                      <h6>Status:</h6>
//                      <p>{currentSelectedTask.taskStatus}</p>
//                   </div>
//                   <div className='single-task-view-task-info-grid-item'>
//                      <h6>Priorytet:</h6>
//                      <p>{currentSelectedTask.priority}</p>
//                   </div>
//                   <div className='single-task-view-task-info-grid-item'>
//                      <h6>Szacowany czas:</h6>
//                      <p>{currentSelectedTask.estimatedHours}</p>
//                   </div>
//                   <div className='single-task-view-task-info-grid-item'>
//                      <h6>Data rozpoczęcia:</h6>
//                      <p>{DateTime.fromFormat(currentSelectedTask.startingDate, appDatabaseDateFormatForFront).toFormat(Environment.dateFormatToDisplay)}</p>
//                   </div>
//                   <div className='single-task-view-task-info-grid-item'>
//                      <h6>Data zakończenia:</h6>
//                      <p>{DateTime.fromFormat(currentSelectedTask.dueDate as string, props.appDatabaseDateFormatForFront).toFormat(Environment.dateFormatToDisplay)}</p>
//                   </div>
//                </div>
//             </CardContent> 
//          </Card>*/}
//       </div>
//    )
// }


// const SingleTaskViewDescription = (props: ISingleTaskViewDescriptionProps) => {
//    return (
//       <div className='single-task-view-task-description'>
//          <Card sx={{ borderRadius: 5 }}>
//             <ScrollPanel style={{ maxHeight: 400 }} className='single-task-view-task-description-inner-scroll-wrapper'>
//                <h5 id="single-task-view-task-description-heading">Opis zadania:</h5>
//                <div dangerouslySetInnerHTML={{ __html: props.descriptionInHTMLFormat }}/>
//             </ScrollPanel>
//          </Card>
//       </div>
//    )
// }


// const SingleTaskViewTimesheetTable = () => {
//    return (
//       <div className='single-task-view-timesheet-table'>

//       </div>
//    )
// }


// const SingleTaskView = () => {
//    const navigate = useNavigate()

//    const currentSelectedTask = useSelector((state: AppState) => state.tasksState.currentSelectedTaskForPreview)
//    const { appDatabaseDateFormatForFront } = useSelector((state: AppState) => state.applicationState)
   
//    if(currentSelectedTask === undefined){
//       navigate(AppLinks.tasks)
//    }
   
//    const { startingDate, dueDate, estimatedHours, descriptionInHTMLFormat } = currentSelectedTask as ITaskResponseModel
   
//    return (
//       <div className='single-task-view-outer-wrapper'>
//          <SingleTaskViewTaskInfo currentSelectedTask={currentSelectedTask as ITaskResponseModel} appDatabaseDateFormatForFront={appDatabaseDateFormatForFront} />
//          <SingleTaskViewTaskStats currentSelectedTask={currentSelectedTask as ITaskResponseModel} appDatabaseDateFormatForFront={appDatabaseDateFormatForFront} />
//          <SingleTaskViewDescription descriptionInHTMLFormat={descriptionInHTMLFormat} />
//          <SingleTaskViewTimesheetTable />
//       </div>
//    )
// }

// export default SingleTaskView