/**
 * Update movie trending status
 */
export const updateMovieTrending = async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const { isTrending } = req.body;

    if (typeof isTrending !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'isTrending must be a boolean value'
      });
    }

    const movie = await prisma.movie.update({
      where: { id },
      data: { isTrending }
    });

    res.json({
      success: true,
      message: `Movie ${isTrending ? 'marked as trending' : 'removed from trending'}`,
      data: { movie }
    });

  } catch (error) {
    console.error('Error updating movie trending status:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
