import Conversation from '../models/Conversation.js';

/**
 * @desc   Get all conversations for the logged-in user (summary, no messages)
 * @route  GET /api/conversations
 * @access Private
 */
export const getConversations = async (req, res) => {
    try {
        const conversations = await Conversation
            .find({ userId: req.user._id })
            .sort({ pinned: -1, updatedAt: -1 })
            .limit(100)
            .select('-messages'); // exclude heavy messages array in list view

        res.json({ success: true, data: conversations });
    } catch (err) {
        console.error('getConversations error:', err);
        res.status(500).json({ success: false, message: 'Failed to fetch conversations' });
    }
};

/**
 * @desc   Get a single conversation with all messages
 * @route  GET /api/conversations/:id
 * @access Private
 */
export const getConversation = async (req, res) => {
    try {
        const conv = await Conversation.findOne({
            _id: req.params.id,
            userId: req.user._id,
        });

        if (!conv) {
            return res.status(404).json({ success: false, message: 'Conversation not found' });
        }

        res.json({ success: true, data: conv });
    } catch (err) {
        console.error('getConversation error:', err);
        res.status(500).json({ success: false, message: 'Failed to fetch conversation' });
    }
};

/**
 * @desc   Create a new empty conversation
 * @route  POST /api/conversations
 * @access Private
 */
export const createConversation = async (req, res) => {
    try {
        const { title = 'New Chat', mode = 'general' } = req.body;

        const conv = await Conversation.create({
            userId: req.user._id,
            title: title.slice(0, 100),
            mode,
            messages: [],
        });

        res.status(201).json({ success: true, data: conv });
    } catch (err) {
        console.error('createConversation error:', err);
        res.status(500).json({ success: false, message: 'Failed to create conversation' });
    }
};

/**
 * @desc   Append a message pair (user + assistant) to a conversation
 * @route  POST /api/conversations/:id/messages
 * @access Private
 */
export const addMessages = async (req, res) => {
    try {
        const { userMessage, assistantMessage } = req.body;

        if (!userMessage || !assistantMessage) {
            return res.status(400).json({ success: false, message: 'userMessage and assistantMessage are required' });
        }

        const conv = await Conversation.findOne({
            _id: req.params.id,
            userId: req.user._id,
        });

        if (!conv) {
            return res.status(404).json({ success: false, message: 'Conversation not found' });
        }

        conv.messages.push(
            { role: 'user', content: userMessage },
            { role: 'assistant', content: assistantMessage }
        );

        // Auto-update title from first user message if still default
        if (conv.title === 'New Chat' && conv.messages.length <= 2) {
            conv.title = userMessage.slice(0, 60) + (userMessage.length > 60 ? '...' : '');
        }

        await conv.save();

        res.json({ success: true, data: conv });
    } catch (err) {
        console.error('addMessages error:', err);
        res.status(500).json({ success: false, message: 'Failed to save messages' });
    }
};

/**
 * @desc   Rename or pin/unpin a conversation
 * @route  PATCH /api/conversations/:id
 * @access Private
 */
export const updateConversation = async (req, res) => {
    try {
        const { title, pinned } = req.body;

        const update = {};
        if (title !== undefined) update.title = title.slice(0, 100);
        if (pinned !== undefined) update.pinned = Boolean(pinned);

        const conv = await Conversation.findOneAndUpdate(
            { _id: req.params.id, userId: req.user._id },
            update,
            { new: true, select: '-messages' }
        );

        if (!conv) {
            return res.status(404).json({ success: false, message: 'Conversation not found' });
        }

        res.json({ success: true, data: conv });
    } catch (err) {
        console.error('updateConversation error:', err);
        res.status(500).json({ success: false, message: 'Failed to update conversation' });
    }
};

/**
 * @desc   Delete a conversation
 * @route  DELETE /api/conversations/:id
 * @access Private
 */
export const deleteConversation = async (req, res) => {
    try {
        const result = await Conversation.findOneAndDelete({
            _id: req.params.id,
            userId: req.user._id,
        });

        if (!result) {
            return res.status(404).json({ success: false, message: 'Conversation not found' });
        }

        res.json({ success: true, message: 'Conversation deleted' });
    } catch (err) {
        console.error('deleteConversation error:', err);
        res.status(500).json({ success: false, message: 'Failed to delete conversation' });
    }
};
